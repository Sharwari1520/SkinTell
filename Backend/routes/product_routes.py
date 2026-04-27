from flask import Blueprint, jsonify, current_app
  # Import app to access MySQL inside functions

product_bp = Blueprint("product_bp", __name__)

@product_bp.route("/", methods=["GET"])
def get_products():
    mysql = current_app.extensions['mysql'] # access MySQL here
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM products")
    rows = cursor.fetchall()
    cursor.close()

    products = []
    for row in rows:
        products.append({
            "product_id": row[0],
            "name": row[1],
            "price": row[2],
            "image_url": row[3],
            "type": row[4],
            "subtype": row[5]
        })

    return jsonify(products), 200
