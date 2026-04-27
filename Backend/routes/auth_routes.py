from flask import Blueprint, request, jsonify, current_app, session
from werkzeug.security import generate_password_hash, check_password_hash
from MySQLdb._exceptions import IntegrityError  # safer import

auth_bp = Blueprint('auth_bp', __name__)

# ---------------- SIGNUP ----------------
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = generate_password_hash(data.get("password"))
    skin_type = data.get("skin_type")

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are required."}), 400

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, skin_type) VALUES (%s, %s, %s, %s)",
            (username, email, password, skin_type)
        )
        mysql.connection.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except IntegrityError:
        return jsonify({"error": "Email already exists. Please log in instead."}), 400
    finally:
        cursor.close()


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()

    # Include email in the SELECT query
    cursor.execute(
        "SELECT user_id, username, password_hash, skin_type, email, phone_number FROM users WHERE username = %s",
        (username,)
    )
    row = cursor.fetchone()
    cursor.close()

    if row:
        # Unpack in the same order as SELECT
        user_id, db_username, db_password_hash, db_skin_type, db_email, db_phone_number = row

        if check_password_hash(db_password_hash, password):
            # store session info
            session['user_id'] = user_id
            session['username'] = db_username
            session['skin_type'] = db_skin_type
            session['email'] = db_email
            session['phone_number'] = db_phone_number

            return jsonify({
                "message": "Login successful!",
                "user": {
                    "id": user_id,
                    "username": db_username,
                    "email": db_email,
                    "skin_type": db_skin_type,
                    "phone_number": db_phone_number
                }
            }), 200
        else:
            return jsonify({"error": "Invalid password."}), 401
    else:
        return jsonify({"error": "User not found."}), 404

# ---------------- UPDATE SKIN TYPE ----------------
@auth_bp.route('/update_skin_type', methods=['POST'])
def update_skin_type():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in."}), 403

    data = request.json
    selected_skin_type = data.get("skin_type")

    if not selected_skin_type:
        return jsonify({"error": "Skin type is required."}), 400

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    cursor.execute(
        "UPDATE users SET skin_type = %s WHERE user_id = %s",
        (selected_skin_type, session['user_id'])
    )
    mysql.connection.commit()
    cursor.close()

    # update session
    session['skin_type'] = selected_skin_type

    return jsonify({"message": "Skin type updated successfully!", "skin_type": selected_skin_type}), 200


# ---------------- UPDATE PHONE NUMBER ----------------
@auth_bp.route('/update_phone_number', methods=['POST'])
def update_phone_number():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in."}), 403

    data = request.json
    phone_number = data.get("phone_number", "").strip()

    if not phone_number:
        return jsonify({"error": "Phone number is required."}), 400

    # Optional: simple validation
    if len(phone_number) < 7 or len(phone_number) > 15:
        return jsonify({"error": "Phone number length seems invalid."}), 400

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    cursor.execute(
        "UPDATE users SET phone_number = %s WHERE user_id = %s",
        (phone_number, session['user_id'])
    )
    mysql.connection.commit()
    cursor.close()

    # update session
    session['phone_number'] = phone_number

    return jsonify({"message": "Phone number updated successfully!", "phone_number": phone_number}), 200
