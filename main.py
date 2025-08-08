from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Directory where Excel files are stored
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_items', methods=['POST'])
def get_items():
    category = request.form.get('category')
    column_name = request.form.get('column_name')
    
    try:
        # Construct file path
        file_path = os.path.join(DATA_DIR, f"{category}.xlsx")
        
        # Read Excel file
        df = pd.read_excel(file_path)
        
        # Get items by column name
        items = df[column_name].tolist()
        
        return jsonify({'success': True, 'items': items})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=False)