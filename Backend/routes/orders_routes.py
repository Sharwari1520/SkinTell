from flask import Blueprint, request, jsonify, current_app, session
from MySQLdb._exceptions import IntegrityError

orders_bp = Blueprint('orders_bp', __name__)

# ---------------- CREATE ORDER WITH ITEMS ----------------
@orders_bp.route('/create_order', methods=['POST'])
def create_order():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in."}), 403

    data = request.json
    customer_name = data.get('customer_name', '').strip()
    email = data.get('email', '').strip()
    phone_number = data.get('phone_number', '').strip()
    delivery_address = data.get('delivery_address', '').strip()
    total_price = data.get('total_price')
    payment_method = data.get('payment_method', '').strip()
    payment_status = data.get('payment_status', 'Pending')  # default to Pending
    cart_items = data.get('cart_items', [])  # List of products

    # ---------------- Debug: Print received data ----------------
    print("[DEBUG] Creating order for user_id:", session['user_id'])
    print("[DEBUG] Order data:", data)

    if not all([customer_name, email, phone_number, delivery_address, total_price, payment_method]):
        return jsonify({"error": "All fields are required."}), 400
    if not cart_items:
        return jsonify({"error": "Cart is empty."}), 400

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    try:
        # Insert order
        cursor.execute("""
            INSERT INTO orders 
            (user_id, customer_name, email, phone_number, delivery_address, total_price, payment_method, payment_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            session['user_id'],
            customer_name,
            email,
            phone_number,
            delivery_address,
            total_price,
            payment_method,
            payment_status
        ))
        mysql.connection.commit()
        order_id = cursor.lastrowid
        print("[DEBUG] Order inserted with order_id:", order_id)

        # Insert each item into order_items
        for item in cart_items:
            product_name = item.get('name')
            product_brand = item.get('brand')
            quantity = item.get('quantity', 1)
            price = item.get('price')

            cursor.execute("""
                INSERT INTO order_items (order_id, product_name, product_brand, quantity, price)
                VALUES (%s, %s, %s, %s, %s)
            """, (order_id, product_name, product_brand, quantity, price))
        
        mysql.connection.commit()
        print("[DEBUG] Inserted", len(cart_items), "items for order_id:", order_id)

        return jsonify({"message": "Order and items created successfully!", "order_id": order_id}), 201
    except IntegrityError as e:
        print("[ERROR] Database IntegrityError:", str(e))
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        print("[ERROR] Database insert failed:", str(e))
        return jsonify({"error": f"Failed to create order: {str(e)}"}), 500
    finally:
        cursor.close()


# ---------------- GET ALL ORDERS FOR LOGGED-IN USER WITH ITEMS ----------------
@orders_bp.route('/my_orders', methods=['GET'])
def my_orders():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in."}), 403

    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    try:
        # Get all orders for the user
        cursor.execute("""
            SELECT order_id, customer_name, email, phone_number, delivery_address, total_price, payment_method, payment_status, created_at
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (session['user_id'],))
        rows = cursor.fetchall()

        orders = []
        for row in rows:
            order_id = row[0]

            # Fetch items for this order
            cursor.execute("""
                SELECT product_name, product_brand, quantity, price
                FROM order_items
                WHERE order_id = %s
            """, (order_id,))
            items_rows = cursor.fetchall()
            items = []
            for item_row in items_rows:
                items.append({
                    "name": item_row[0],
                    "brand": item_row[1],
                    "quantity": item_row[2],
                    "price": float(item_row[3])
                })

            orders.append({
                "order_id": order_id,
                "customer_name": row[1],
                "email": row[2],
                "phone_number": row[3],
                "delivery_address": row[4],
                "total_price": float(row[5]),
                "payment_method": row[6],
                "payment_status": row[7],
                "created_at": row[8].strftime("%Y-%m-%d %H:%M:%S"),
                "items": items
            })

        print("[DEBUG] Retrieved orders for user_id:", session['user_id'], "Count:", len(orders))
        return jsonify({"orders": orders}), 200
    except Exception as e:
        print("[ERROR] Failed to fetch orders:", str(e))
        return jsonify({"error": f"Failed to fetch orders: {str(e)}"}), 500
    finally:
        cursor.close()
