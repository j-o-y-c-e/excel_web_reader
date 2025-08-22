from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Directory where Excel files are stored
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

@app.route('/')
def index():
    """Main route - serves the index.html template"""
    return render_template('index.html')

@app.route('/get_categories', methods=['GET', 'POST'])
def get_categories():
    """Returns list of available categories (Excel/CSV files without extensions)"""
    try:
        # List all Excel/CSV files in the data directory
        files = []
        for files1 in os.listdir(DATA_DIR):
            if files1.endswith('.xlsx') or files1.endswith('.csv'):
                name_only = os.path.splitext(os.path.basename(files1))[0]
                # print(files, type(files))
                files.append(name_only)  # Remove extension
                # print('appended to files', files)
        return jsonify({'success': True, 'categories': files})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/get_columns', methods=['POST'])
def get_column_name():
    """Returns column names for a specific category/file"""
    try:
        # Get category from request form data
        category = request.form.get('category')
        
        # Validate that category is provided
        if not category:
            return jsonify({'success': False, 'error': 'No category provided'})
        
        # Search for file with supported extensions (.xlsx and .csv)
        for ext in ['.xlsx', '.csv']:
            file_path = os.path.join(DATA_DIR, f"{category}{ext}")
            if os.path.exists(file_path):
                # Read file based on extension type
                if ext == '.xlsx':
                    df = pd.read_excel(file_path)
                else:
                    df = pd.read_csv(file_path)
                # Return list of column names
                return jsonify({'success': True, 'columns': list(df.columns)})
        
        # Return error if no matching file found
        return jsonify({'success': False, 'error': 'File not found'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/get_items', methods=['POST'])
def get_items():
    """Returns items from a specific column in a file"""
    try:
        # Get parameters from request form data
        category = request.form.get('category')
        column_name = request.form.get('column_name')
        
        # Validate required parameters
        if not category or not column_name:
            return jsonify({'success': False, 'error': 'Missing category or column parameter'})
        
        # Find file with correct extension
        file_path = None
        for ext in ['.xlsx', '.csv']:
            temp_path = os.path.join(DATA_DIR, f"{category}{ext}")
            if os.path.exists(temp_path):
                file_path = temp_path
                break
        
        # Return error if file not found
        if not file_path:
            return jsonify({'success': False, 'error': 'File not found'})
        
        # Read file based on extension type
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, header=0)  # Use first row as headers
        else:
            df = pd.read_csv(file_path, header=0)
        
        # Verify requested column exists in the dataframe
        if column_name not in df.columns:
            return jsonify({
                'success': False,
                'error': f"Column '{column_name}' not found",
                'available_columns': list(df.columns)
            })
        
        # Get all non-null values from the specified column and convert to list
        items = df[column_name].dropna().tolist()
        
        # Return success response with items and column list
        return jsonify({
            'success': True,
            'items': items,
            'columns': list(df.columns)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    # Run Flask application in debug mode
    app.run(debug=True)