# Handles CART (future feature, currently optional)
from flask import Blueprint, jsonify, request

cart_bp = Blueprint("cart", __name__)

# CART - placeholder
@cart_bp.route("/", methods=["GET", "POST", "DELETE"])
def cart_handler():
    # TODO: Implement cart DB logic here
    return jsonify({"message": "Cart feature coming soon!"})
