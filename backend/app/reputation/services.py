from datetime import datetime, timezone
from bson import ObjectId
from .config import LEVELS, ACHIEVEMENTS_REGISTRY

def get_level_info(total_xp):
    """Calculates level info based on total XP."""
    for level_data in LEVELS:
        if level_data["min_xp"] <= total_xp <= level_data["max_xp"]:
            next_level_xp = level_data["max_xp"] + 1 if level_data["level"] < 6 else None
            return {
                "currentLevel": level_data["level"],
                "levelName": level_data["name"],
                "levelBadge": level_data["badge"],
                "nextLevelXP": next_level_xp,
                "xpToNextLevel": (next_level_xp - total_xp) if next_level_xp else 0
            }
    # Fallback to Explorer
    return {
        "currentLevel": 1,
        "levelName": "Explorer",
        "levelBadge": "🌱",
        "nextLevelXP": 500,
        "xpToNextLevel": 500 - total_xp
    }

def award_xp(db, participant_id, source_type, source_id, amount, description):
    """
    Awards XP if the transaction (source_type + source_id) hasn't been recorded yet.
    """
    # Check for duplicate
    existing = db.xp_transactions.find_one({
        "participantId": participant_id,
        "sourceType": source_type,
        "sourceId": source_id
    })
    
    if existing:
        return False, "XP already awarded for this action."

    # Record transaction
    transaction = {
        "participantId": participant_id,
        "sourceType": source_type,
        "sourceId": source_id,
        "xpAmount": amount,
        "description": description,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    db.xp_transactions.insert_one(transaction)

    # Update user's total XP
    user = db.users.find_one({"_id": ObjectId(participant_id)})
    if not user:
        return False, "User not found."

    new_total_xp = user.get("totalXP", 0) + amount
    level_info = get_level_info(new_total_xp)

    db.users.update_one(
        {"_id": ObjectId(participant_id)},
        {"$set": {
            "totalXP": new_total_xp,
            "currentLevel": level_info["currentLevel"],
            "levelName": level_info["levelName"],
            "levelBadge": level_info["levelBadge"]
        }}
    )

    return True, {"transaction": transaction, "new_total_xp": new_total_xp, "level_info": level_info}

def get_reputation_summary(db, participant_id):
    """
    Returns the user's reputation summary (XP, level, recent transactions).
    """
    user = db.users.find_one({"_id": ObjectId(participant_id)})
    if not user:
        return None

    total_xp = user.get("totalXP", 0)
    level_info = get_level_info(total_xp)
    
    recent_transactions = list(
        db.xp_transactions.find({"participantId": str(participant_id)}, {"_id": 0})
        .sort("createdAt", -1)
        .limit(5)
    )

    # Count achievements
    unlocked_count = db.participant_achievements.count_documents({
        "participantId": str(participant_id),
        "unlocked": True
    })

    return {
        "totalXP": total_xp,
        **level_info,
        "recentTransactions": recent_transactions,
        "achievementsCount": unlocked_count
    }

def get_participant_achievements(db, participant_id):
    """
    Returns the full list of achievements (locked, in-progress, unlocked) 
    by mapping the registry to the participant's records.
    """
    participant_records = list(db.participant_achievements.find({"participantId": str(participant_id)}))
    record_map = {rec["achievementId"]: rec for rec in participant_records}

    result = []
    unlocked_count = 0
    in_progress_count = 0
    locked_count = 0

    for ach in ACHIEVEMENTS_REGISTRY:
        record = record_map.get(ach["id"])
        
        status = "LOCKED"
        progress = 0
        unlocked_at = None

        if record:
            progress = record.get("progress", 0)
            if record.get("unlocked"):
                status = "UNLOCKED"
                unlocked_at = record.get("unlockedAt")
                unlocked_count += 1
            elif progress > 0:
                status = "IN_PROGRESS"
                in_progress_count += 1
            else:
                locked_count += 1
        else:
            locked_count += 1

        result.append({
            **ach,
            "status": status,
            "progress": progress,
            "unlockedAt": unlocked_at
        })

    return {
        "summary": {
            "unlocked": unlocked_count,
            "inProgress": in_progress_count,
            "locked": locked_count
        },
        "collection": result
    }

def check_and_award_achievements(db, participant_id):
    """
    Evaluates participant activity and unlocks achievements if criteria are met.
    (This is a simplified evaluation for the mock implementation).
    """
    # In a fully fleshed out system, this would query registrations, submissions, etc.
    # to accurately count progress. For the mock seed, we manually insert records, 
    # but this function serves as the entry point for background evaluation.
    pass
