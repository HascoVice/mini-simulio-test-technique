from flask import Flask, jsonify, request


app=Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, API!"})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)