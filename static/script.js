document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category-select');
    const columnSelect = document.getElementById('column-select'); 
    const itemsList = document.getElementById('items-list');
    
    // Charger les catégories disponibles
    fetch('/get_categories')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
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
    
    // Écouter les changements de sélection de catégorie
    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        
        if (!selectedCategory) {
            columnSelect.innerHTML = '<option value="">-- Sélectionnez une colonne --</option>';
            itemsList.innerHTML = '';
            return;
        }
        
        // Charger les colonnes disponibles pour cette catégorie
        const formData = new FormData();
        formData.append('category', selectedCategory);
        
        fetch('/get_items', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            columnSelect.innerHTML = '<option value="">-- Sélectionnez une colonne --</option>';
            
            if (data.success) {
                data.columns.forEach(column => {
                    const option = document.createElement('option');
                    option.value = column;
                    option.textContent = column;
                    columnSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Fetch error:', error));
    });
    
    // Écouter les changements de sélection de colonne
    columnSelect.addEventListener('change', function() {
        const selectedCategory = categorySelect.value;
        const selectedColumn = this.value;
        
        if (!selectedCategory || !selectedColumn) {
            itemsList.innerHTML = '';
            return;
        }
        
        // Envoyer la requête pour obtenir les items
        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('column_name', selectedColumn);
        
        fetch('/get_items', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            itemsList.innerHTML = '';
            
            if (data.success) {
                data.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    itemsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'Erreur: ' + data.error;
                itemsList.appendChild(li);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            itemsList.innerHTML = '<li>Erreur lors du chargement des données</li>';
        });
    });
});