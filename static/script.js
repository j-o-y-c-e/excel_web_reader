document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const categorySelect = document.getElementById('category-select');
    const columnSelect = document.getElementById('column-select'); 
    const itemsList = document.getElementById('items-list');
    
    // Load available categories from the server
    fetch('/get_categories')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset and add default option to category dropdown
                categorySelect.innerHTML = '<option value="">-- Choose a category --</option>';
                
                // Add each category as an option in the dropdown
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            } else {
                console.error('Error loading categories:', data.error);
            }
        })
        .catch(error => console.error('Fetch error:', error));
    
    // Listen for category selection changes
    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        
        // Reset column dropdown and items list
        columnSelect.innerHTML = '<option value="">-- Choose a column --</option>';
        itemsList.innerHTML = '';
        
        // Exit if no category is selected
        if (!selectedCategory) return;
        
        // Prepare form data with the selected category
        const formData = new FormData();
        formData.append('category', selectedCategory);
        
        // Fetch available columns for the selected category
        fetch('/get_columns', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Add each column as an option in the dropdown
                data.columns.forEach(column => {
                    const option = document.createElement('option');
                    option.value = column;
                    option.textContent = column;
                    columnSelect.appendChild(option);
                });
            } else {
                console.error('Error loading columns:', data.error);
            }
        })
        .catch(error => console.error('Fetch error:', error));
    });
    
    // Listen for column selection changes
    columnSelect.addEventListener('change', function() {
        const selectedCategory = categorySelect.value;
        const selectedColumn = this.value;
        
        // Clear the items list
        itemsList.innerHTML = '';
        
        // Exit if no category or column is selected
        if (!selectedCategory || !selectedColumn) return;
        
        // Prepare form data with the selected category and column
        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('column_name', selectedColumn);
        
        // Fetch items from the selected column
        fetch('/get_items', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display each item in the list
                data.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    itemsList.appendChild(li);
                });
            } else {
                // Display error message if request failed
                const li = document.createElement('li');
                li.textContent = 'Error: ' + data.error;
                itemsList.appendChild(li);
            }
        })
        .catch(error => {
            // Handle network or other errors
            console.error('Fetch error:', error);
            itemsList.innerHTML = '<li>Error while loading data</li>';
        });
    });
});