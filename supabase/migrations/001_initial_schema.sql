-- Halo Protocol Database Schema
-- Run this migration in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    auth_provider VARCHAR(20),
    trust_score INTEGER DEFAULT 0,
    trust_tier VARCHAR(20) DEFAULT 'newcomer',
    trust_score_pda VARCHAR(44),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- CIRCLES
CREATE TABLE circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_pubkey VARCHAR(44) UNIQUE NOT NULL,
    creator_id UUID REFERENCES users(id),
    name VARCHAR(100),
    description TEXT,
    contribution_amount BIGINT NOT NULL,
    token_mint VARCHAR(44) NOT NULL,
    duration_months SMALLINT NOT NULL,
    max_members SMALLINT NOT NULL,
    penalty_rate INTEGER NOT NULL,
    payout_method VARCHAR(20) DEFAULT 'fixed_rotation',
    min_trust_tier VARCHAR(20) DEFAULT 'newcomer',
    is_public BOOLEAN DEFAULT true,
    invite_code VARCHAR(20),
    status VARCHAR(20) DEFAULT 'forming',
    current_members SMALLINT DEFAULT 0,
    current_month SMALLINT DEFAULT 0,
    total_pot BIGINT DEFAULT 0,
    total_yield_earned BIGINT DEFAULT 0,
    escrow_pubkey VARCHAR(44),
    insurance_pool_pubkey VARCHAR(44),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CIRCLE MEMBERS
CREATE TABLE circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    member_pda VARCHAR(44),
    status VARCHAR(20) DEFAULT 'active',
    stake_amount BIGINT DEFAULT 0,
    insurance_staked BIGINT DEFAULT 0,
    payout_position SMALLINT,
    has_received_pot BOOLEAN DEFAULT false,
    penalties BIGINT DEFAULT 0,
    contributions_missed SMALLINT DEFAULT 0,
    trust_score_at_join INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

-- CONTRIBUTIONS
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    month SMALLINT NOT NULL,
    amount BIGINT NOT NULL,
    on_time BOOLEAN DEFAULT true,
    days_late SMALLINT DEFAULT 0,
    tx_signature VARCHAR(88) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYOUTS
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id),
    month SMALLINT NOT NULL,
    gross_amount BIGINT NOT NULL,
    fee_amount BIGINT DEFAULT 0,
    net_amount BIGINT NOT NULL,
    yield_share BIGINT DEFAULT 0,
    payout_method VARCHAR(20),
    tx_signature VARCHAR(88),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSALS (Governance)
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_chain_pubkey VARCHAR(44),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    proposer_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    proposal_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    voting_end TIMESTAMPTZ NOT NULL,
    votes_for BIGINT DEFAULT 0,
    votes_against BIGINT DEFAULT 0,
    executed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    circle_id UUID REFERENCES circles(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    tx_signature VARCHAR(88),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_circles_public ON circles(is_public, status);
CREATE INDEX idx_members_circle ON circle_members(circle_id);
CREATE INDEX idx_members_user ON circle_members(user_id);
CREATE INDEX idx_contributions_circle_month ON contributions(circle_id, month);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE NOT read;
CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_circle ON activity_log(circle_id, created_at DESC);
CREATE INDEX idx_payouts_circle ON payouts(circle_id, month);
CREATE INDEX idx_proposals_circle ON proposals(circle_id, status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users: can read own row, service role can do everything
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Service role bypass for webhook syncing
CREATE POLICY "Service role full access to users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- Circles: public circles visible to all authenticated, private only to members
CREATE POLICY "Anyone can view public circles"
    ON circles FOR SELECT
    USING (is_public = true);

CREATE POLICY "Members can view their private circles"
    ON circles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = circles.id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to circles"
    ON circles FOR ALL
    USING (auth.role() = 'service_role');

-- Circle Members: visible to co-members
CREATE POLICY "Members can view co-members"
    ON circle_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = circle_members.circle_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to circle_members"
    ON circle_members FOR ALL
    USING (auth.role() = 'service_role');

-- Contributions: visible to circle members
CREATE POLICY "Circle members can view contributions"
    ON contributions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = contributions.circle_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to contributions"
    ON contributions FOR ALL
    USING (auth.role() = 'service_role');

-- Payouts: visible to circle members
CREATE POLICY "Circle members can view payouts"
    ON payouts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = payouts.circle_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to payouts"
    ON payouts FOR ALL
    USING (auth.role() = 'service_role');

-- Proposals: visible to circle members
CREATE POLICY "Circle members can view proposals"
    ON proposals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = proposals.circle_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to proposals"
    ON proposals FOR ALL
    USING (auth.role() = 'service_role');

-- Notifications: own only
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Service role full access to notifications"
    ON notifications FOR ALL
    USING (auth.role() = 'service_role');

-- Activity Log: visible to circle members
CREATE POLICY "Circle members can view activity"
    ON activity_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_members cm
            WHERE cm.circle_id = activity_log.circle_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to activity_log"
    ON activity_log FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER circles_updated_at
    BEFORE UPDATE ON circles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
