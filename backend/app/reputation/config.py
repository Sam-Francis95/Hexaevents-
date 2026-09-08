# Reputation System Configuration

LEVELS = [
    {"level": 1, "name": "Explorer", "min_xp": 0, "max_xp": 499, "badge": "🌱"},
    {"level": 2, "name": "Builder", "min_xp": 500, "max_xp": 999, "badge": "🔨"},
    {"level": 3, "name": "Innovator", "min_xp": 1000, "max_xp": 1999, "badge": "💡"},
    {"level": 4, "name": "Competitor", "min_xp": 2000, "max_xp": 3499, "badge": "🏆"},
    {"level": 5, "name": "Achiever", "min_xp": 3500, "max_xp": 4999, "badge": "⭐"},
    {"level": 6, "name": "Champion", "min_xp": 5000, "max_xp": float('inf'), "badge": "👑"},
]

XP_REWARDS = {
    "registration": 50,
    "registration_approved": 25,
    "event_completion": 100,
    "workshop_completion": 50,
    "submission": 100,
    "certificate": 50,
    "team_join": 25,
    "profile_completion": 25,
}

ACHIEVEMENTS_REGISTRY = [
    {
        "id": "FIRST_STEP",
        "name": "First Step",
        "description": "Registered for your first HexaEvents event.",
        "icon": "🏅",
        "xp_reward": 50,
        "rarity": "COMMON",
        "category": "Participation",
        "criteria": {"type": "event_registrations", "target": 1}
    },
    {
        "id": "HACK_BUILDER",
        "name": "Hack Builder",
        "description": "Completed 3 hackathons.",
        "icon": "💻",
        "xp_reward": 150,
        "rarity": "RARE",
        "category": "Hackathons",
        "criteria": {"type": "event_completions", "category": "Hackathon", "target": 3}
    },
    {
        "id": "IDEA_MACHINE",
        "name": "Idea Machine",
        "description": "Participated in 5 ideathons.",
        "icon": "💡",
        "xp_reward": 150,
        "rarity": "RARE",
        "category": "Ideathons",
        "criteria": {"type": "event_completions", "category": "Ideathon", "target": 5}
    },
    {
        "id": "TEAM_PLAYER",
        "name": "Team Player",
        "description": "Successfully participated in 5 team events.",
        "icon": "🤝",
        "xp_reward": 100,
        "rarity": "RARE",
        "category": "Teams",
        "criteria": {"type": "team_events", "target": 5}
    },
    {
        "id": "PODIUM_FINISHER",
        "name": "Podium Finisher",
        "description": "Finished in the top 3 of a competition.",
        "icon": "🏆",
        "xp_reward": 300,
        "rarity": "EPIC",
        "category": "Competition",
        "criteria": {"type": "competition_wins", "target": 1}
    },
    {
        "id": "CERTIFICATE_COLLECTOR",
        "name": "Certificate Collector",
        "description": "Earned 10 certificates.",
        "icon": "📜",
        "xp_reward": 200,
        "rarity": "EPIC",
        "category": "Achievements",
        "criteria": {"type": "certificates_earned", "target": 10}
    },
    {
        "id": "EVENT_EXPLORER",
        "name": "Event Explorer",
        "description": "Participated in 10 different events.",
        "icon": "🎯",
        "xp_reward": 250,
        "rarity": "EPIC",
        "category": "Participation",
        "criteria": {"type": "event_completions", "target": 10}
    },
    {
        "id": "EVENT_STREAK",
        "name": "Event Streak",
        "description": "Participated in events for 5 consecutive weeks.",
        "icon": "🔥",
        "xp_reward": 200,
        "rarity": "LEGENDARY",
        "category": "Consistency",
        "criteria": {"type": "weekly_streak", "target": 5}
    }
]
