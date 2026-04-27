import smtplib  
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random, re, string, io
from datetime import datetime, timedelta

from flask import Flask, session, request, send_file, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont

# ------------------ Initialize Flask App ------------------
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "supersecretkey"

# ------------------ MySQL Configuration ------------------
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Sharwari@1520'
app.config['MYSQL_DB'] = 'skincare_db'

# Initialize MySQL
mysql = MySQL(app)
app.extensions['mysql'] = mysql

# ------------------ Import Blueprints ------------------
from routes.auth_routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/auth")

from routes.orders_routes import orders_bp
app.register_blueprint(orders_bp, url_prefix="/orders")

from routes.tracker_routes import tracker_bp
app.register_blueprint(tracker_bp, url_prefix="/tracker")

# ------------------ Ensure Tracker Table Exists ------------------
def create_tracker_table():
    # Use app context to access mysql.connection safely
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tracker (
                tracker_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                selfies JSON,
                habits JSON,
                tasks JSON,
                progress_percentage INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        mysql.connection.commit()
        cursor.close()

# Call the table creation safely
create_tracker_table()

# ------------------ Email OTP Routes ------------------
@app.route("/send_email_otp", methods=["POST"])
def send_email_otp():
    data = request.get_json()
    email = data.get("email", "").strip()
    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"status": "error", "message": "Invalid email format"}), 400

    otp = str(random.randint(100000, 999999))
    sender_email = "sharwaridake@gmail.com"
    sender_password = "cjrsmrwyebjtmkaj"
    subject = "Your SkinTell OTP"
    body = f"Your OTP for SkinTell is: {otp}. It is valid for 5 minutes."

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[DEBUG] OTP sent to {email}: {otp}")
    except Exception as e:
        print(f"[ERROR] Failed to send email: {str(e)}")
        return jsonify({"status": "error", "message": f"Failed to send email: {str(e)}"}), 500

    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_otp (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100),
                otp_code VARCHAR(6),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified BOOLEAN DEFAULT FALSE
            )
        """)
        cursor.execute("INSERT INTO email_otp (email, otp_code) VALUES (%s, %s)", (email, otp))
        mysql.connection.commit()
        cursor.close()

    session['email'] = email
    return jsonify({"status": "success", "message": "OTP sent to email successfully."})

@app.route("/verify_email_otp", methods=["POST"])
def verify_email_otp():
    data = request.get_json()
    otp_input = data.get("otp")
    email = session.get("email")

    if not email:
        return jsonify({"status": "error", "message": "Session expired. Please request a new OTP."}), 400
    if not otp_input:
        return jsonify({"status": "error", "message": "OTP is required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM email_otp WHERE email=%s ORDER BY created_at DESC LIMIT 1", (email,))
    record = cursor.fetchone()
    cursor.close()

    if not record:
        return jsonify({"status": "error", "message": "OTP not found. Please request a new OTP."}), 400

    otp_time = record[3] if isinstance(record[3], datetime) else datetime.strptime(record[3], "%Y-%m-%d %H:%M:%S")
    time_now = datetime.now()

    if record[2] == otp_input and otp_time >= time_now - timedelta(minutes=5):
        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE email_otp SET verified=TRUE WHERE id=%s", (record[0],))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Email verified successfully!"})
    else:
        return jsonify({"status": "error", "message": "Invalid or expired OTP."}), 400

# ------------------ Update Phone Number ------------------
@app.route("/auth/update_phone_number", methods=["POST"])
def update_phone_number():
    if 'user_id' not in session:
        return jsonify({"status": "error", "message": "User not logged in."}), 403

    data = request.get_json()
    phone_number = data.get("phone_number", "").strip()

    if not phone_number:
        return jsonify({"status": "error", "message": "Phone number is required."}), 400

    PHONE_REGEX = r"^\d{10,15}$"
    if not re.match(PHONE_REGEX, phone_number):
        return jsonify({"status": "error", "message": "Invalid phone number format."}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE users SET phone_number=%s WHERE user_id=%s",
            (phone_number, session['user_id'])
        )
        mysql.connection.commit()
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to update phone number: {str(e)}"}), 500
    finally:
        cursor.close()

    return jsonify({"status": "success", "phone_number": phone_number})

# ------------------ CAPTCHA Route ------------------
@app.route("/generate_captcha")
def generate_captcha():
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    session['captcha_text'] = captcha_text
    print(f"[DEBUG] Generated CAPTCHA: {captcha_text}")

    img = Image.new("RGB", (150, 50), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 36)
    except:
        font = ImageFont.load_default()
    draw.text((10, 5), captcha_text, fill=(0, 0, 0), font=font)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")

# ------------------ Signup Route with CAPTCHA Verification ------------------
@app.route('/signup', methods=['POST'])
def signup():
    user_input = request.form.get('captcha', '')
    actual_captcha = session.get('captcha_text', '')

    if user_input.upper() != actual_captcha.upper():
        return "Incorrect CAPTCHA! Please try again."

    username = request.form.get('username', '').strip()
    email = request.form.get('email', '').strip()
    password = request.form.get('password', '').strip()  # TODO: hash before storing

    if not username or not email or not password:
        return "All fields are required!"

    cursor = mysql.connection.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50),
                email VARCHAR(100),
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, password)
        )
        mysql.connection.commit()
    except Exception as e:
        return f"Error creating user: {str(e)}"
    finally:
        cursor.close()

    return "CAPTCHA Verified! Signup successful."

# ------------------ Run Flask App ------------------
if __name__ == "__main__":
    print("[INFO] Starting Flask server...")
    app.run(debug=True)
