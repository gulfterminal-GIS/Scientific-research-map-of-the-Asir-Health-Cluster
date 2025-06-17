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
    const [esriConfig, intl, Map, MapView, reactiveUtils, GeoJSONLayer, FeatureLayer, CSVLayer] =
      await Promise.all([
        loadModule("esri/config"),
        loadModule("esri/intl"),
        loadModule("esri/Map"),
        loadModule("esri/views/MapView"),
        loadModule("esri/core/reactiveUtils"),
        loadModule("esri/layers/GeoJSONLayer"),
        loadModule("esri/layers/FeatureLayer"),
        loadModule("esri/layers/CSVLayer"),
      ]);

    intl.setLocale("ar");
    esriConfig.apiKey = "AAPK756f006de03e44d28710cb446c8dedb4rkQyhmzX6upFiYPzQT0HNQNMJ5qPyO1TnPDSPXT4EAM_DlQSj20ShRD7vyKa7a1H";

    // let url = "https://services7.arcgis.com/5laxbRHagCrsTh6t/arcgis/rest/services/c1010_JSONToFeatures/FeatureServer/0";
    // const renderer = {
    //   type: "heatmap",
    //   colorStops: [
    //     { color: [133, 193, 200, 0], ratio: 0 },
    //     { color: [133, 193, 200, 0], ratio: 0.01 },
    //     { color: [133, 193, 200, 255], ratio: 0.01 },
    //     { color: [133, 193, 200, 255], ratio: 0.01 },
    //     { color: [144, 161, 190, 255], ratio: 0.0925 },
    //     { color: [156, 129, 132, 255], ratio: 0.175 },
    //     { color: [167, 97, 170, 255], ratio: 0.2575 },
    //     { color: [175, 73, 128, 255], ratio: 0.34 },
    //     { color: [184, 48, 85, 255], ratio: 0.4225 },
    //     { color: [192, 24, 42, 255], ratio: 0.505 },
    //     { color: [200, 0, 0, 255], ratio: 0.5875 },
    //     { color: [211, 51, 0, 255], ratio: 0.67 },
    //     { color: [222, 102, 0, 255], ratio: 0.7525 },
    //     { color: [233, 153, 0, 255], ratio: 0.835 },
    //     { color: [244, 204, 0, 255], ratio: 0.9175 },
    //     { color: [255, 255, 0, 255], ratio: 1 },
    //   ],
    //   maxDensity: 0.01,
    //   minDensity: 0,
    // };

    map = new Map({
      basemap: "gray-vector",
      // layers: [layer01]
    });

    view = new MapView({
      container: "viewDiv",
      center: [43.417931, 17.778259], // long and lat for KSA
      zoom: 6,
      map: map
    });


    // let layer01 = new GeoJSONLayer({
    //   url: "https://raw.githubusercontent.com/ashrafayman219/rejected-heatmap/refs/heads/main/new.json",
    //   title: "البيانات الوصفية",
    //   popupTemplate: {
    //     title: "{الامانة}, {البلدية}",
    //     content: [
    //       {
    //         type: "fields",
    //         fieldInfos: [
    //           {
    //             fieldName: "رقم_الزيارة",
    //             label: "رقم_الزيارة",
    //           },
    //           {
    //             fieldName: "اسم_المراقب",
    //             label: "اسم المراقب",
    //           },
    //           {
    //             fieldName: "هوية_المراقب",
    //             label: "هوية المراقب",
    //           },
    //           {
    //             fieldName: "تاريخ_ووقت_الاسناد",
    //             label: "تاريخ ووقت الاسناد",
    //           },
    //           {
    //             fieldName: "نوع_الرقابة",
    //             label: "نوع الرقابة",
    //           },
    //           {
    //             fieldName: "حالة_الزيارة",
    //             label: "حالة الزيارة",
    //           },
    //           {
    //             fieldName: "نوع_الزيارة",
    //             label: "نوع_الزيارة",
    //           },
    //           {
    //             fieldName: "اسم_المراجع",
    //             label: "اسم_المراجع",
    //           },
    //           {
    //             fieldName: "اسم_المعتمد",
    //             label: "اسم_المعتمد",
    //           },
    //           {
    //             fieldName: "اسم_النشاط_التفصيلي",
    //             label: "اسم النشاط التفصيلي",
    //           },
    //           {
    //             fieldName: "رقم_الزيارة",
    //             label: "رقم_الزيارة",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   renderer: renderer,
    //   labelsVisible: true,
    // });
    // map.add(layer01);


    const colors = ["#33bbff", "#33ff39", "#c27c30", "#7f3dcf"];

    const hours40 = {
      type: "simple-marker",
      size: 12,
      outline: {
        // color: "rgba(0, 139, 174, 0.5)",
        color: "rgba(189, 187, 187, 0.5)",
        width: 2
      },
      color: colors[0]
    };

    const hours80 = {
      type: "simple-marker",
      size: 15,
      outline: {
        color: "rgba(189, 187, 187, 0.5)",
        width: 2
      },
      color: colors[1]
    };

    const hours112 = {
      type: "simple-marker",
      size: 18,
      outline: {
        color: "rgba(189, 187, 187, 0.5)",
        width: 2
      },
      color: colors[2]
    };

    const hours168 = {
      type: "simple-marker",
      size: 21,
      outline: {
        color: "rgba(189, 187, 187, 0.5)",
        width: 2
      },
      color: colors[3]
    };

    const sizeRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      legendOptions: {
        title: "التصنيف تبعاً لعدد ساعات العمل"
      },
      field: "Size",
      uniqueValueInfos: [
        {
          value: 40,
          symbol: hours40,
          label: "8"
        },
        {
          value: "80",
          symbol: hours80,
          label: "16/5"
        },
        {
          value: "112",
          symbol: hours112,
          label: "16/7"
        },
        {
          value: "168",
          symbol: hours168,
          label: "24/7"
        }
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
    map.add(layer01);  // adds the layer to the map

    const layer02 = new CSVLayer({
      url: "https://raw.githubusercontent.com/gulfterminal-GIS/Scientific-research-map-of-the-Asir-Health-Cluster/refs/heads/main/Yes.csv",
      copyright: "Yes",
      title: "تمت إضافته في خطة الصيف",
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
      renderer: sizeRenderer,
    });
    map.add(layer02);  // adds the layer to the map

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
      renderer: sizeRenderer,
    });
    map.add(layer03);  // adds the layer to the map


    Promise.all([
      view.whenLayerView(layer01),
      view.whenLayerView(layer02),
      view.whenLayerView(layer03),
      // view.whenLayerView(fLayer2)
    ]).then(([layerView1, layerView2, layerView3]) => {
      return Promise.all(
        [
          reactiveUtils.whenOnce(() => !layerView1.updating),
          reactiveUtils.whenOnce(() => !layerView2.updating),
          reactiveUtils.whenOnce(() => !layerView3.updating),
          // reactiveUtils.whenOnce(() => !layerView2.updating)
        ]
      );
    }).then(() => {
      console.log("done updating")
      view.goTo(
        {
          target: layer01.fullExtent,
        },
        {
          duration: 2000,
        }
      );

      // const heatmapRenderer = layer01.renderer.clone();
      // // The following simple renderer will render all points as simple
      // // markers at certain scales
      // const simpleRenderer = {
      //   type: "simple",
      //   symbol: {
      //     type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
      //     url: "https://daraobeirne.github.io/kisspng-drawing-pin-world-map-logo-push-vector-5ae029f6ddeaf4.198342921524640246909.png",
      //     width: "30px",
      //     height: "30px"
      //   }
      // };

      // // When the scale is larger than 1:72,224 (zoomed in passed that scale),
      // // then switch from a heatmap renderer to a simple renderer. When zoomed
      // // out beyond that scale, switch back to the heatmap renderer
      // reactiveUtils.watch(
      //   () => view.scale,
      //   (scale) => {
      //     layer01.renderer = scale <= 72224 ? simpleRenderer : heatmapRenderer;
      //   }
      // );


    });





    await view.when(() => {
    });



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
  .then(() => {
    console.log("Map Returned From Require Scope", displayMap);
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
      Legend
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