from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from ..models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify({
            'access_token': access_token,
            'user': {
                'username': user.username,
                'role': user.role,
                'branch': user.branch
            }
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'message': 'User already exists'}), 400

    new_user = User(
        username=data.get('username'),
        password_hash=generate_password_hash(data.get('password')),
        role=data.get('role', 'user'),
        branch=data.get('branch')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201
