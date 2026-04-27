from flask import Blueprint, request, jsonify, current_app
import json

tracker_bp = Blueprint('tracker', __name__)

# ---------------- Add/Update Daily Tracker ----------------
@tracker_bp.route('/tracker', methods=['POST'])
def add_or_update_tracker():
    data = request.json
    mysql = current_app.extensions['mysql']
    cursor = None

    try:
        username = data.get('username')
        selfies = data.get('selfies', [])
        habits = data.get('habits', {})
        tasks = data.get('tasks', [])
        progress = data.get('progress_percentage', 0)

        if not username:
            return jsonify({"status": "error", "message": "Username missing"}), 400

        cursor = mysql.connection.cursor()

        # Convert to JSON strings for MySQL storage
        selfies_json = json.dumps(selfies)
        habits_json = json.dumps(habits)
        tasks_json = json.dumps(tasks)

        # Check if tracker entry exists for today
        cursor.execute(
            "SELECT tracker_id FROM tracker WHERE username=%s AND DATE(created_at)=CURDATE()",
            (username,)
        )
        existing = cursor.fetchone()

        if existing:
            # Update existing record
            tracker_id = existing[0]
            cursor.execute("""
                UPDATE tracker
                SET selfies=%s, habits=%s, tasks=%s, progress_percentage=%s
                WHERE tracker_id=%s
            """, (selfies_json, habits_json, tasks_json, progress, tracker_id))
            message = "Your progress has been updated ✅"
        else:
            # Insert new record
            cursor.execute("""
                INSERT INTO tracker (username, selfies, habits, tasks, progress_percentage)
                VALUES (%s, %s, %s, %s, %s)
            """, (username, selfies_json, habits_json, tasks_json, progress))
            message = "Your progress has been saved ✅"

        mysql.connection.commit()
        return jsonify({"status": "success", "message": message})

    except Exception as e:
        if 'mysql' in locals():
            mysql.connection.rollback()
        print("[ERROR] Tracker save failed:", e)
        return jsonify({"status": "error", "message": "Error saving tracker: " + str(e)}), 500

    finally:
        if cursor:
            cursor.close()

# ---------------- Get Tracker Data ----------------
@tracker_bp.route('/tracker/<username>', methods=['GET'])
def get_tracker(username):
    mysql = current_app.extensions['mysql']
    cursor = None

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT tracker_id, username, selfies, habits, tasks, progress_percentage, created_at
            FROM tracker
            WHERE username=%s
            ORDER BY created_at DESC
        """, (username,))

        # Fetch all rows
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        tracker_entries = []
        for row in rows:
            entry = dict(zip(columns, row))
            # Parse JSON fields
            entry['selfies'] = json.loads(entry['selfies']) if entry['selfies'] else []
            entry['habits'] = json.loads(entry['habits']) if entry['habits'] else {}
            entry['tasks'] = json.loads(entry['tasks']) if entry['tasks'] else []
            tracker_entries.append(entry)

        return jsonify({"status": "success", "data": tracker_entries})

    except Exception as e:
        print("[ERROR] Tracker fetch failed:", e)
        return jsonify({"status": "error", "message": "Error fetching tracker: " + str(e)}), 500

    finally:
        if cursor:
            cursor.close()
