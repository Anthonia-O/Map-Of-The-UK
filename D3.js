let currentMap; // Global variable to store the map instance
let townLayerGroup; // Layer group to hold town markers for easy clearing

// Function to update town count based on slider value and update the map
function updateTownCount(value) {
    document.getElementById('townCountLabel').textContent = value;
    addTown(currentMap, value); 
}

// Function to reload data when the slider is adjusted
function reloadData() {
    const townCount = document.getElementById('townCount').value;
    addTown(currentMap, townCount);
}

// Bouncing effect function
function bounceEffect(circle) {
    let growing = true;
    let initialRadius = circle.getRadius();
    let bounceInterval = setInterval(() => {
        let currentRadius = circle.getRadius();

        if (growing) {
            if (currentRadius < initialRadius + 3) {
                circle.setRadius(currentRadius + 1);
            } else {
                growing = false;
            }
        } else {
            if (currentRadius > initialRadius) {
                circle.setRadius(currentRadius - 1);
            } else {
                growing = true;
            }
        }
    }, 100);

    // Return a function to stop the bounce effect
    return () => clearInterval(bounceInterval);
}

// Hover effect function with animation
function addHoverEffect(circle) {
    circle.on('mouseover', function () {  
        this.setStyle({ radius: 14, fillOpacity: 0.7, color: '#30a0ff', fillColor: 'red', fillOpacity: 0.5});
        this.openPopup();
    });

    circle.on('mouseout', function () {
        this.setStyle({ radius: 5, fillOpacity: 0.5, color: 'blue', fillColor: '#30a0ff', fillOpacity: 0.5});
        this.closePopup();
    });
}

// Function to animate circle appearance
function animateCircle(circle, finalRadius) {
    let currentRadius = 0;
    const step = finalRadius / 50; // Adjust the speed of animation here

    function increaseRadius() {
        if (currentRadius < finalRadius) {
            currentRadius += step;
            circle.setStyle({ radius: currentRadius });
            requestAnimationFrame(increaseRadius);
        } else {
            circle.setStyle({ radius: finalRadius });
        }
    }
    increaseRadius();
}

function addTown(map, number) {
    const townsUrl = `http://34.147.162.172/Circles/Towns/${number}`;
    
    townLayerGroup.clearLayers(); // Clear any existing towns from the layer group

    d3.json(townsUrl).then(data => {
        const townsData = data.map(town => {
            return [town.lat, town.lng, town.Town, town.Population, town.County];
        });

        townsData.forEach(town => {
            const circle = L.circleMarker([town[0], town[1]], {
                color: 'blue',
                fillColor: '#30a0ff',
                fillOpacity: 0.5,
                radius: 0 // Start with a radius of 0 for animation
            }).addTo(map);

            // Animate circle appearance to full size
            animateCircle(circle, 1);

            // add bounce effect
            bounceEffect(circle)

            // Bind tooltip with town information
            circle.bindTooltip(`Town: ${town[2]}<br> Population: ${town[3]}<br> County: ${town[4]}`, { 
                permanent: false, 
                direction: 'top' 
            });

            // Add hover effect to the circle
            addHoverEffect(circle);

            // Add a delayed bounce effect
            const delay = Math.random() * 500; // Random delay up to 2000ms
            setTimeout(() => bounceEffect(circle), delay);


            // Add the circle to the town layer group
            circle.addTo(townLayerGroup);
        });
    }).catch(error => console.error('Error loading towns data:', error));
}

function addMultipleLayers(map) {
    const key = 'dW36PjpYk5i5B3IJ5PJC';
    const layers = {
        "Night": L.tileLayer(`https://api.maptiler.com/maps/uk-openzoomstack-night/{z}/{x}/{y}.png?key=${key}`, { tileSize: 512, zoomOffset: -1 }),
        "Light": L.tileLayer(`https://api.maptiler.com/maps/uk-openzoomstack-light/{z}/{x}/{y}.png?key=${key}`, { tileSize: 512, zoomOffset: -1 }),
        "Outdoor": L.tileLayer(`https://api.maptiler.com/maps/uk-openzoomstack-outdoor/{z}/{x}/{y}.png?key=${key}`, { tileSize: 512, zoomOffset: -1 }),
        "Road": L.tileLayer(`https://api.maptiler.com/maps/uk-openzoomstack-road/{z}/{x}/{y}.png?key=${key}`, { tileSize: 512, zoomOffset: -1 })
    };

    L.control.layers(layers).addTo(map);
}

function addBaseLayer(map, layer) {
    const key = 'dW36PjpYk5i5B3IJ5PJC';
    return L.tileLayer(`https://api.maptiler.com/maps/uk-openzoomstack-${layer}/{z}/{x}/{y}.png?key=${key}`, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 5,
        maxZoom: 19,
        attribution: `<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>`
    }).addTo(map);
}

function initializeMap() {
    currentMap = L.map('map').setView([55, -4], 5.5); // Starting position
    addBaseLayer(currentMap, 'night');
    addMultipleLayers(currentMap);
    townLayerGroup = L.layerGroup().addTo(currentMap);
    addTown(currentMap, 50);
}

window.onload = initializeMap;
