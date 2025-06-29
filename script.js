let map;
let view;

function loadModule(moduleName) {
  return new Promise((resolve, reject) => {
    require([moduleName], (module) => {
      if (module) {
        resolve(module);
      } else {
        reject(new Error(`Module not found: ${moduleName}`));
      }
    }, (error) => {
      reject(error);
    });
  });
}

async function initializeHeatMap() {
  try {
    const [esriConfig, intl, Map, MapView, reactiveUtils, GeoJSONLayer, FeatureLayer, CSVLayer, Feature, promiseUtils] =
      await Promise.all([
        loadModule("esri/config"),
        loadModule("esri/intl"),
        loadModule("esri/Map"),
        loadModule("esri/views/MapView"),
        loadModule("esri/core/reactiveUtils"),
        loadModule("esri/layers/GeoJSONLayer"),
        loadModule("esri/layers/FeatureLayer"),
        loadModule("esri/layers/CSVLayer"),
        loadModule("esri/widgets/Feature"),
        loadModule("esri/core/promiseUtils"),
      ]);

    intl.setLocale("ar");
    esriConfig.apiKey = "AAPK756f006de03e44d28710cb446c8dedb4rkQyhmzX6upFiYPzQT0HNQNMJ5qPyO1TnPDSPXT4EAM_DlQSj20ShRD7vyKa7a1H";

    map = new Map({
      // basemap: "gray-vector",
      basemap: "hybrid",
      // layers: [layer01]
    });

    view = new MapView({
      container: "viewDiv",
      center: [43.417931, 17.778259], // long and lat for KSA
      zoom: 6,
      map: map
    });



    // Add this at the top level of your initializeHeatMap function, after creating the view
    const featureWidget = new Feature({
      map: map,
      spatialReference: view.spatialReference
    });

    // Create HTML element for feature display
    const featureContainer = document.createElement('div');
    featureContainer.id = 'feature-container';
    featureContainer.className = 'esri-widget';
    document.body.appendChild(featureContainer);




// Add this to your layerConfig
// Update the layerConfig to handle both layers
const layerConfig = {
    handlePointerEvents: () => {
        let currentHighlight = null;
        const featureContainer = document.getElementById('feature-container') || 
            createFeatureContainer();

        view.on("click", async (event) => {
            try {
                if (currentHighlight) {
                    currentHighlight.remove();
                    currentHighlight = null;
                }

                const hitTest = await view.hitTest(event, {
                    include: [layer02, hospitals]
                });

                const result = hitTest.results[0];
                if (result) {
                    const feature = result.graphic;
                    const layerView = await view.whenLayerView(result.graphic.layer);
                    currentHighlight = layerView.highlight(feature);

                    // Determine which display function to use based on the layer
                    if (result.graphic.layer === hospitals) {
                        updateHospitalDisplay(feature, featureContainer, currentHighlight);
                    } else {
                        updateFeatureDisplay(feature, featureContainer, currentHighlight);
                    }
                } else {
                    featureContainer.classList.remove('visible');
                }
            } catch (error) {
                console.error("Error in click handler:", error);
            }
        });
    }
};




// Add this new function for hospital display
function updateHospitalDisplay(feature, container, highlight) {
    const content = `
        <div class="feature-card">
            <div class="feature-card-header">
                <div class="facility-icon">
                    <i class="fas fa-hospital"></i>
                </div>
                <h3 class="facility-name">${feature.attributes.الاسم}</h3>
                <button class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="feature-card-body">
                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="info-content">
                        <label>نوع المنشأة</label>
                        <span>${feature.attributes.نوع_المنشأة}</span>
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="info-content">
                        <label>المدينة</label>
                        <span>${feature.attributes.المدينة}</span>
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <div class="info-content">
                        <label>الإحداثيات</label>
                        <span>
                            ${feature.attributes.longitude}, ${feature.attributes.latitude}
                        </span>
                    </div>
                </div>
            </div>

            <div class="feature-card-footer">
                <button class="maps-btn" onclick="window.open('https://www.google.com/maps?q=${feature.attributes.latitude},${feature.attributes.longitude}', '_blank')">
                    <i class="fas fa-map-marked-alt"></i>
                    فتح في خرائط Google
                </button>
            </div>
        </div>
    `;

    container.innerHTML = content;
    container.classList.add('visible');

    const closeBtn = container.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        container.style.transform = 'translateY(100%)';
        container.style.opacity = '0';
        
        setTimeout(() => {
            container.classList.remove('visible');
            container.style.transform = '';
            container.style.opacity = '';
            if (highlight) {
                highlight.remove();
            }
        }, 400);
    });
}

// Add layer type filter handling
// Update the initializeLayerTypeFilter function to receive the layers
function initializeLayerTypeFilter(phcLayer, hospitalsLayer) {
    const layerTypeFilter = document.getElementById('layerTypeFilter');
    const cityFilter = document.getElementById('cityFilter');
    const hoursFilter = document.getElementById('hoursFilter');
    const sidePanel = document.getElementById('sidePanel');

    layerTypeFilter.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        
        if (selectedType === 'all') {
            // Show all layers
            phcLayer.visible = true;
            hospitalsLayer.visible = true;
            cityFilter.disabled = true;
            hoursFilter.disabled = true;
        } else {
            // Show selected layer
            phcLayer.visible = selectedType === 'phc';
            hospitalsLayer.visible = selectedType === 'hospitals';
            
            // Enable city filter only
            cityFilter.disabled = false;
            hoursFilter.disabled = true;
        }
        
        // Reset filters
        cityFilter.value = 'all';
        hoursFilter.value = 'all';
        
        // Collapse sidebar
        sidePanel.classList.add('collapsed');
    });
}


// Add touch handling for mobile (optional)
function addTouchHandling(container) {
    let startY;
    let startHeight;
    const minHeight = 30; // Minimum height in vh
    const maxHeight = 70; // Maximum height in vh

    container.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startY = touch.clientY;
        startHeight = container.offsetHeight;
    });

    container.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const deltaY = touch.clientY - startY;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, (startHeight - deltaY) / window.innerHeight * 100));
        container.style.height = `${newHeight}vh`;
    });

    container.addEventListener('touchend', () => {
        // Snap to either expanded or collapsed state
        const currentHeight = (container.offsetHeight / window.innerHeight) * 100;
        container.style.height = `${currentHeight > 50 ? maxHeight : minHeight}vh`;
    });
}



// Update your createFeatureContainer function
function createFeatureContainer() {
    const container = document.createElement('div');
    container.id = 'feature-container';
    container.className = 'feature-panel';
    document.body.appendChild(container);
    addTouchHandling(container); // Add touch handling
    return container;
}

// Enhanced updateFeatureDisplay function
function updateFeatureDisplay(feature, container, highlight) {
    const content = `
        <div class="feature-card">
            <div class="feature-card-header">
                <div class="facility-icon">
                    <i class="fas fa-hospital-alt"></i>
                </div>
                <h3 class="facility-name">${feature.attributes.facility_name}</h3>
                <button class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="feature-card-body">
                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="info-content">
                        <label>نوع المنشأة</label>
                        <span>${feature.attributes.facility_type}</span>
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="info-content">
                        <label>المدينة</label>
                        <span>${feature.attributes.Sector}</span>
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="info-content">
                        <label>ساعات العمل</label>
                        <span>${getWorkingHours(feature.attributes.Size)}</span>
                    </div>
                </div>
            </div>

            <div class="feature-card-footer">
                <button class="maps-btn" onclick="window.open('https://www.google.com/maps?q=${feature.attributes.latitude},${feature.attributes.longitude}', '_blank')">
                    <i class="fas fa-map-marked-alt"></i>
                    فتح في خرائط Google
                </button>
            </div>
        </div>
    `;

    container.innerHTML = content;
    container.classList.add('visible');

    // Update close button functionality
    // Update close button functionality with proper cleanup
    const closeBtn = container.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        // Add closing animation class
        container.style.transform = 'translateY(100%)';
        container.style.opacity = '0';
        
        setTimeout(() => {
            container.classList.remove('visible');
            container.style.transform = ''; // Reset transform
            container.style.opacity = ''; // Reset opacity
            if (highlight) {
                highlight.remove();
            }
        }, 400);
    });
}

// Add this CSS
const combinedStyles = `

#feature-container {
    position: fixed; /* Change to fixed for better mobile positioning */
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%; /* Full width */
    height: 30vh; /* 30% of viewport height */
    background: transparent !important;
    z-index: 1000;
    display: none;
    transform: translateY(100%); /* Start from below the screen */
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; /* Allow clicks to pass through the container */
}

#feature-container.visible {
    display: block;
    transform: translateY(0);
    opacity: 1;
}


.feature-panel {
    position: absolute;
    bottom: 20px; /* Changed from top to bottom */
    right: 20px;
    width: 320px;
    background: transparent !important; /* Force transparency */
    box-shadow: none !important; /* Remove shadow */
    z-index: 1000;
    display: none;
    transform: translateY(100%); /* Start from below */
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-panel.visible {
    display: block;
    transform: translateY(0);
    opacity: 1;
}

.feature-card {
    position: relative;
    background: white;
    border-radius: 20px 20px 0 0; /* Rounded corners only on top */
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    height: 100%;
    pointer-events: auto; /* Re-enable pointer events for the card */
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}


@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

.feature-card-header {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
    padding: 15px 20px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Add a drag handle indicator */
.feature-card-header::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.facility-icon {
    background: rgba(255, 255, 255, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.facility-name {
    margin: 0;
    font-size: 1.1em;
    font-weight: 500;
    flex-grow: 1;
}

.close-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.2s ease;
    position: absolute;
    top: 10px;
    left: 10px;
}

.close-btn:hover {
    transform: scale(1.1);
}

.feature-card-body {
    padding: 15px 20px;
    background: transparent;
    overflow-y: auto;
    max-height: calc(100% - 140px); /* Adjust based on header and footer height */
}

.info-row {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(238, 242, 247, 0.5);
    transition: all 0.2s ease;
    background: transparent;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row:hover {
    background: transparent;
    transform: translateX(-5px);
}

.info-icon {
    width: 35px;
    height: 35px;
    background: rgba(227, 242, 253, 0.7);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2196F3;
}

.info-content {
    flex-grow: 1;
}

.info-content label {
    display: block;
    font-size: 0.85em;
    color: #666;
    margin-bottom: 3px;
}

.info-content span {
    display: block;
    color: #333;
    font-weight: 500;
}

.feature-card-footer {
    padding: 15px 20px;
    background: transparent;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

.maps-btn {
    width: 100%;
    padding: 12px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.maps-btn:hover {
    background: #3367d6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
}

.maps-btn i {
    font-size: 1.1em;
}

/* Mobile specific styles */
@media screen and (max-width: 768px) {
    #feature-container {
        height: 36vh; /* Slightly taller on mobile */
    }

    .feature-card-body {
        padding: 12px 15px;
    }

    .info-row {
        padding: 10px 0;
    }
}
    .custom-alert {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        background: #f8f9fa;
        color: #2c3e50;
        padding: 16px 24px;
        border-radius: 8px;
        border-left: 4px solid #3498db;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95em;
        min-width: 300px;
        max-width: 90%;
    }

    .custom-alert.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    .custom-alert i {
        font-size: 1.2em;
    }

    @keyframes alertShake {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        25% { transform: translateX(-53%) translateY(0); }
        75% { transform: translateX(-47%) translateY(0); }
    }

    .custom-alert.shake {
        animation: alertShake 0.5s ease-in-out;
    }

`;

// Apply the styles
if (!document.getElementById('feature-panel-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'feature-panel-styles';
    styleSheet.textContent = combinedStyles;
    document.head.appendChild(styleSheet);
}

function getWorkingHours(size) {
    const hoursMap = {
        "4": "٨ص - ١١:٥٩م الأحد - الخميس",
        "4A": "٨ص - ١١:٥٩م جميع أيام الأسبوع",
        "8": "٨ص - ٤م الأحد - الخميس",
        "24": "٢٤ ساعة جميع أيام الأسبوع"
    };
    return hoursMap[size] || "-";
}








    const geojsonlayer = new GeoJSONLayer({
      url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/Aseer01.geojson",
      copyright: "Aseer",
      legendEnabled: false,
      title: "Aseer",
      renderer: {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [51,51,204,0.2],
          style: "solid",
          outline: {
            // makes the outlines of all features consistently light gray
            color: "green",
            width: 3
          }
        }
      }
    });
    map.add(geojsonlayer);  // adds the layer to the map




    const hours8 = {
      type: "simple-marker",
      size: 7,
      color: [48, 152, 201],
      outline: null
    };

    const hours4A = {
      type: "simple-marker",
      size: 7,
      color: [255, 242, 135],
      outline: null
    };

    const hours4 = {
      type: "simple-marker",
      size: 7,
      color: [255, 147, 0],
      outline: null
    };

    const hours24 = {
      type: "simple-marker",
      size: 7,
      color: [150, 100, 100],
      outline: null
      // outline: {
      //   width: 2,
      //   color: "gray"
      // }
    };

    const sizeRenderer = {
      type: "unique-value",
      legendOptions: {
        title: "التصنيف تبعاً لعدد ساعات العمل"
      },
      field: "Size",
      uniqueValueInfos: [
        {
          value: "8",
          symbol: hours8,
          label: "٨ص - ٤م الأحد - الخميس"
        },
        {
          value: "40",
          symbol: hours4A,
          label: "٨ص - ١١:٥٩م جميع أيام الأسبوع"
        },
        {
          value: "4",
          symbol: hours4,
          label: "٨ص - ١١:٥٩م الأحد - الخميس"
        },
        {
          value: "24",
          symbol: hours24,
          label: "٢٤ ساعة جميع أيام الأسبوع"
        },
      ]
    };

    const clusterConfig = {
      type: "cluster",
      clusterRadius: "100px",
      // {cluster_count} is an aggregate field containing
      // the number of features comprised by the cluster
      popupTemplate: {
        title: "Cluster summary",
        content: "This cluster represents {cluster_count} earthquakes.",
        fieldInfos: [{
          fieldName: "cluster_count",
          format: {
            places: 0,
            digitSeparator: true
          }
        }]
      },
      clusterMinSize: "24px",
      clusterMaxSize: "60px",
      labelingInfo: [{
        deconflictionStrategy: "none",
        labelExpressionInfo: {
          expression: "Text($feature.cluster_count, '#,###')"
        },
        symbol: {
          type: "text",
          color: "#004a5d",
          font: {
            weight: "bold",
            family: "Noto Sans",
            size: "12px"
          }
        },
        labelPlacement: "center-center",
      }]
    };

    const layer01 = new CSVLayer({
      url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/Health%20Cluster%20in%20Asir.csv",
      copyright: "Health Cluster in Asir",
      title: "التجمع الصحي في عسير",
      popupTemplate: {
        title: "{facility_name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "directorate_name",
                label: "اسم المديرية",
              },
              {
                fieldName: "Sector",
                label: "القطاع",
              },
              {
                fieldName: "longitude",
                label: "خط الطول",
              },
              {
                fieldName: "latitude",
                label: "دائرة العرض",
              },
              {
                fieldName: "facilitytype",
                label: "نوع المنشأة",
              },
              {
                fieldName: "Size",
                label: "الحجم",
              },
              {
                fieldName: "working hours",
                label: "ساعات العمل",
              },
            ],
          },
        ],
      },
      featureReduction: clusterConfig,
      // renderer: {
      //   type: "simple",
      //   field: "mag",
      //   symbol: {
      //     type: "simple-marker",
      //     size: 4,
      //     color: "#69dcff",
      //     outline: {
      //       color: "rgba(0, 139, 174, 0.5)",
      //       width: 5
      //     }
      //   }
      // },
      renderer: sizeRenderer,
      labelsVisible: true,
      visible: false
    });
    // map.add(layer01);  // adds the layer to the map

    const layer03 = new CSVLayer({
      url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/No.csv",
      copyright: "No",
      title: "لم تتم إضافته في خطة الصيف",
      popupTemplate: {
        title: "{facility_name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "directorate_name",
                label: "اسم المديرية",
              },
              {
                fieldName: "Sector",
                label: "القطاع",
              },
              {
                fieldName: "longitude",
                label: "خط الطول",
              },
              {
                fieldName: "latitude",
                label: "دائرة العرض",
              },
              {
                fieldName: "facilitytype",
                label: "نوع المنشأة",
              },
              {
                fieldName: "Size",
                label: "الحجم",
              },
              {
                fieldName: "working hours",
                label: "ساعات العمل",
              },
            ],
          },
        ],
      },
      labelsVisible: true,
      // featureReduction: clusterConfig,
      // visible: false,
      renderer: {
        type: "simple",
        field: "mag",
        symbol: {
          type: "picture-marker",
          url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/output-onlinepngtools.png",
          width: "21px",
          height: "21px"
        }
      },
    });
    // map.add(layer03);  // adds the layer to the map








    const layer02 = new CSVLayer({
      url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/Health%20Cluster%20in%20Asir02.csv",
      copyright: "Health Cluster in Asir",
      title: "التجمع الصحي في عسير",
      // popupTemplate: {
      //   title: "{facility_name}",
      //   content: [
      //     {
      //       type: "fields",
      //       fieldInfos: [
      //         {
      //           fieldName: "facility_type",
      //           label: "نوع المنشأة",
      //         },
      //         {
      //           fieldName: "Sector",
      //           label: "المدينة",
      //         },
      //         {
      //           fieldName: "working hours",
      //           label: "ساعات العمل",
      //         },
      //         {
      //           fieldName: "Location",
      //           label: "موقع المنشأة",
      //         },
      //       ],
      //     },
      //   ],
      // },
      // renderer: {
      //   type: "simple",
      //   field: "mag",
      //   symbol: {
      //     type: "simple-marker",
      //     size: 4,
      //     color: "#69dcff",
      //     outline: {
      //       color: "rgba(0, 139, 174, 0.5)",
      //       width: 5
      //     }
      //   }
      // },
      labelsVisible: true,
      // featureReduction: clusterConfig,
      // visible: false,
      renderer: sizeRenderer
    });
    map.add(layer02);  // adds the layer to the map

    const hospitals = new CSVLayer({
        url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/All%20Hospitals%20Aseer%20Cluster%20-%20All%20.csv",
        copyright: "Hospitals in Asir",
        title: "المستشفيات",
        // popupTemplate: {
        //   title: "{facility_name}",
        //   content: [
        //     {
        //       type: "fields",
        //       fieldInfos: [
        //         {
        //           fieldName: "facility_type",
        //           label: "نوع المنشأة",
        //         },
        //         {
        //           fieldName: "Sector",
        //           label: "المدينة",
        //         },
        //         {
        //           fieldName: "working hours",
        //           label: "ساعات العمل",
        //         },
        //         {
        //           fieldName: "Location",
        //           label: "موقع المنشأة",
        //         },
        //       ],
        //     },
        //   ],
        // },
        renderer: {
          type: "simple",
          symbol: {
            type: "web-style",  // autocasts as new WebStyleSymbol()
            // name: "hospital",
            // styleName: "Esri2DPointSymbolsStyle",
            name: "Hospital",
            styleUrl: "https://cdn.arcgis.com/sharing/rest/content/items/6eeef46c653b40c9bda04f9bed913b70/data"
          }
        },
        labelsVisible: true,
        // featureReduction: clusterConfig,
        // visible: false,
        // renderer: sizeRenderer
    });
    map.add(hospitals);  // adds the layer to the map



    layerConfig.handlePointerEvents();


    // Initialize sector filter after layers are added
    // After adding both layers to the map
    Promise.all([
        view.whenLayerView(layer02),
        view.whenLayerView(hospitals)
    ]).then(([layer02View, hospitalsView]) => {
        // Initialize both filters with access to both layers
        initializeFilters([layer02, hospitals]); 
        // initializeLayerTypeFilter(layer02, hospitals); // Pass both layers to the function
    });

    Promise.all([
      // view.whenLayerView(layer01),
      view.whenLayerView(layer02),
      view.whenLayerView(hospitals),
      // view.whenLayerView(fLayer2)
    ]).then(([layerView2, hospitalsLayerView]) => {
      return Promise.all(
        [
          // reactiveUtils.whenOnce(() => !layerView1.updating),
          reactiveUtils.whenOnce(() => !layerView2.updating),
          reactiveUtils.whenOnce(() => !hospitalsLayerView.updating),
          // reactiveUtils.whenOnce(() => !layerView2.updating)
        ]
      );
    }).then(() => {
      console.log("done updating")
      view.goTo(
        {
          target: layer02.fullExtent,
        },
        {
          duration: 2000,
        }
      );


    });





    await view.when();



    addWidgets()
      .then(([view, displayMap]) => {
        console.log(
          "Widgets Returned From Require Scope",
          view,
          displayMap,
          featureLayer
        );
        // You can work with the view object here
      })
      .catch((error) => {
        // Handle any errors here
      });


    return [view, map];
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }

}



// calling
initializeHeatMap()
  .then(([view, map]) => {
    console.log("Map Returned From Require Scope", view, map);
    // You can work with the view object here
  })
  .catch((error) => {
    // Handle any errors here
  });



async function addWidgets() {
  try {
    // await initializeMap();

    const [
      Fullscreen,
      BasemapGallery,
      Expand,
      ScaleBar,
      AreaMeasurement2D,
      Search,
      Home,
      LayerList,
      Legend,
      Locate
    ] = await Promise.all([
      loadModule("esri/widgets/Fullscreen"),
      loadModule("esri/widgets/BasemapGallery"),
      loadModule("esri/widgets/Expand"),
      loadModule("esri/widgets/ScaleBar"),
      loadModule("esri/widgets/AreaMeasurement2D"),
      loadModule("esri/widgets/Search"),
      loadModule("esri/widgets/Home"),
      loadModule("esri/widgets/LayerList"),
      loadModule("esri/widgets/Legend"),
      loadModule("esri/widgets/Locate"),
    ]);

    var basemapGallery = new BasemapGallery({
      view: view,
    });

    view.ui.move("zoom", "top-right");

    var Expand22 = new Expand({
      view: view,
      content: basemapGallery,
      expandIcon: "basemap",
      group: "top-right",
      // expanded: false,
      expandTooltip: "اضغط لفتح معرض الخرائط",
      collapseTooltip: "اغلاق",
    });
    view.ui.add([Expand22], { position: "top-right", index: 6 });

    var fullscreen = new Fullscreen({
      view: view,
    });
    view.ui.add(fullscreen, "top-right");

    var scalebar = new ScaleBar({
      view: view,
      unit: "metric",
    });
    view.ui.add(scalebar, "bottom-right");

    // typical usage
    let locate = new Locate({
      view: view
    });
    view.ui.add(locate, "top-right");

    var search = new Search({
      //Add Search widget
      view: view,
      container: "searchDiv",
      popupEnabled: true,
      position: "relative", // This helps with proper positioning
      resultGraphicEnabled: true,
      goToOverride: (view, params) => {
        params.target.zoom = Math.min(params.target.zoom, 15);
        return view.goTo(params.target);
      }
    });

    // Improve search results behavior
    search.on("search-focus", () => {
      const searchContainer = document.querySelector(".esri-search__container");
      if (searchContainer) {
        searchContainer.style.zIndex = "103";
      }
    });

    // Handle search suggestions hover
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const suggestionsMenu = document.querySelector(".esri-search__suggestions-menu");
          if (suggestionsMenu) {
            suggestionsMenu.style.position = "absolute";
            suggestionsMenu.style.zIndex = "103";
            suggestionsMenu.style.width = "100%";
          }
        }
      });
    });

    // Start observing the search container for changes
    const searchContainer = document.getElementById("searchDiv");
    if (searchContainer) {
      observer.observe(searchContainer, {
        childList: true,
        subtree: true
      });
    }


    var homeWidget = new Home({
      view: view,
    });
    view.ui.add(homeWidget, "top-right");

    let legend = new Legend({
      view: view,
      container: "legendDiv"
    });



    var layerList = new LayerList({
      view: view,
      container: "layerListDiv",
      listItemCreatedFunction: function (event) {
        var item = event.item;
        // displays the legend for each layer list item
        item.panel = {
          content: "legend",
          // open: true
        };
      },
      showLegend: true,
    });


    // Handle layer visibility changes
    layerList.on("trigger-action", (event) => {
      if (event.action.id === "full-extent") {
        const targetLayer = event.item.layer;
        if (targetLayer && targetLayer.visible) {
          toggleLoading(true);
          view.goTo(targetLayer.fullExtent, { duration: 1000 })
            .then(() => toggleLoading(false))
            .catch(() => {
              toggleLoading(false);
              console.error("Error zooming to layer extent");
            });
        }
      }
    });

    // Add custom actions to layer list items
    layerList.on("trigger-action", (event) => {
      const item = event.item;
      item.actionsSections = [
        [{
          title: "الذهاب إلى نطاق الطبقة",
          className: "esri-icon-zoom-out-fixed",
          id: "full-extent"
        }]
      ];
    });



    // Improved toggle button handling
    const toggleButton = document.getElementById("toggleButton");
    const sidePanel = document.getElementById("sidePanel");
    const viewDiv = document.getElementById("viewDiv");

    if (toggleButton && sidePanel) {
      toggleButton.addEventListener("click", (e) => {
        e.preventDefault();
        sidePanel.classList.toggle("collapsed");

        // Ensure view updates properly
        view.padding = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        };
      });
    }


    // Ensure proper view updating when layers change
    if (map && map.layers) {
      map.layers.forEach(mapLayer => {
        mapLayer.watch("visible", (visible) => {
          if (visible) {
            toggleLoading(true);
            view.goTo(mapLayer.fullExtent, {
              duration: 1000,
              easing: "ease-out"
            })
              .then(() => toggleLoading(false))
              .catch((error) => {
                console.error("Error zooming to layer:", error);
                toggleLoading(false);
              });
          }
        });
      });
    }

    layerList.visibilityAppearance = "checkbox";
    // var Expand5 = new Expand({
    //   view: view,
    //   content: layerList,
    //   expandIcon: "layers",
    //   group: "top-right",
    //   // expanded: false,
    //   expandTooltip: "قائمه الطبقات",
    //   collapseTooltip: "اغلاق",
    // });
    // Expand5.expanded = true;
    // view.ui.add([Expand5], { position: "top-left", index: 6 });


    // Handle view updating
    view.when(() => {
      // Update view padding to ensure widgets don't overlap with sidebar
      view.padding = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
    });

    return [view, map]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

// Loading indicator function
function toggleLoading(show) {
  const loader = document.getElementById('loadingIndicator');
  if (loader) {
    if (show) {
      loader.classList.remove('d-none');
    } else {
      loader.classList.add('d-none');
    }
  }
}


function initializeFilters(layers) {
    const layerTypeFilter = document.getElementById('layerTypeFilter');
    const cityFilter = document.getElementById('cityFilter');
    const hoursFilter = document.getElementById('hoursFilter');
    const sidePanel = document.getElementById('sidePanel');

    let currentCityFilter = 'all';
    let currentHoursFilter = 'all';
    
    const phcLayer = layers[0];
    const hospitalLayer = layers[1];

    // Initially enable city filter, disable hours filter
    cityFilter.disabled = false;
    hoursFilter.disabled = true;

    // Layer type filter change handler
    layerTypeFilter.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        
        // Always show both layers when "all" is selected
        if (selectedType === 'all') {
            phcLayer.visible = true;
            hospitalLayer.visible = true;
            hoursFilter.disabled = true;
        } else if (selectedType === 'hospitals') {
            phcLayer.visible = false;
            hospitalLayer.visible = true;
            hoursFilter.disabled = true;
        } else { // PHC centers
            phcLayer.visible = true;
            hospitalLayer.visible = false;
            // Enable hours filter only if a city is selected
            hoursFilter.disabled = currentCityFilter === 'all';
        }
        
        // Reset filters
        hoursFilter.value = 'all';
        currentHoursFilter = 'all';
        
        // Apply current city filter if any
        if (currentCityFilter !== 'all') {
            validateAndApplyFilters();
        }
        
        // Collapse sidebar
        sidePanel.classList.add('collapsed');
    });

    // City filter change handler
    cityFilter.addEventListener('change', async (e) => {
        currentCityFilter = e.target.value;
        const selectedType = layerTypeFilter.value;
        
        if (currentCityFilter === 'all') {
            hoursFilter.disabled = true;
            hoursFilter.value = 'all';
            currentHoursFilter = 'all';
        } else {
            // Enable hours filter only for PHC centers
            hoursFilter.disabled = selectedType !== 'phc';
        }
        
        await validateAndApplyFilters();
    });

    // Hours filter change handler
    hoursFilter.addEventListener('change', async (e) => {
        currentHoursFilter = e.target.value;
        await validateAndApplyFilters();
    });

    async function validateAndApplyFilters() {
        toggleLoading(true);

        try {
            const selectedType = layerTypeFilter.value;
            let phcExpression = '';
            let hospitalExpression = '';
            
            // Handle city filter for both layers
            if (currentCityFilter !== 'all') {
                phcExpression = `Sector = '${currentCityFilter}'`;
                hospitalExpression = `المدينة = '${currentCityFilter}'`;
                
                // Add hours filter for PHC centers if selected
                if (selectedType === 'phc' && currentHoursFilter !== 'all') {
                    const fullExpression = `${phcExpression} AND Size = '${currentHoursFilter}'`;
                    
                    // Validate the combination
                    const query = phcLayer.createQuery();
                    query.where = fullExpression;
                    const results = await phcLayer.queryFeatures(query);
                    
                    if (results.features.length === 0) {
                        showCustomAlert('لا توجد مراكز صحية بهذه الساعات في المدينة المختارة');
                        hoursFilter.value = 'all';
                        currentHoursFilter = 'all';
                    } else {
                        phcExpression = fullExpression;
                    }
                }
            }

            // Apply filters based on selected type
            if (selectedType === 'all') {
                phcLayer.definitionExpression = phcExpression;
                hospitalLayer.definitionExpression = hospitalExpression;
            } else if (selectedType === 'hospitals') {
                hospitalLayer.definitionExpression = hospitalExpression;
            } else {
                phcLayer.definitionExpression = phcExpression;
            }

            // Calculate extent for visible layers
            const extents = [];
            if (phcLayer.visible && phcLayer.definitionExpression) {
                const phcExtent = await phcLayer.queryExtent({
                    where: phcLayer.definitionExpression,
                    outSpatialReference: view.spatialReference
                });
                if (phcExtent) extents.push(phcExtent.extent);
            }
            if (hospitalLayer.visible && hospitalLayer.definitionExpression) {
                const hospitalExtent = await hospitalLayer.queryExtent({
                    where: hospitalLayer.definitionExpression,
                    outSpatialReference: view.spatialReference
                });
                if (hospitalExtent) extents.push(hospitalExtent.extent);
            }

            // Zoom to combined extent
            if (extents.length > 0) {
                const combinedExtent = extents.reduce((acc, extent) => 
                    acc ? acc.union(extent) : extent
                );
                await view.goTo({
                    target: combinedExtent.expand(1.5),
                    duration: 1000,
                    easing: "ease-out"
                });
            }

            // Collapse sidebar
            sidePanel.classList.add('collapsed');

        } catch (error) {
            console.error('Error applying filters:', error);
            showCustomAlert('حدث خطأ أثناء تطبيق الفلتر');
        } finally {
            toggleLoading(false);
        }
    }
}

// Add this function for the custom alert
function showCustomAlert(message) {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    const alert = document.createElement('div');
    alert.className = 'custom-alert';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(alert);

    // Show animation
    setTimeout(() => {
        alert.classList.add('show');
        alert.classList.add('shake');
    }, 100);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 400);
    }, 3000);
}
