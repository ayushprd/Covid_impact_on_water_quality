

var IMG = ee.ImageCollection("COPERNICUS/S2_SR")
            .filterBounds(geometry)
            .filterDate("2019-06-01", "2019-06-30")
            .sort('CLOUDY_PIXEL_PERCENTAGE',true)
            .first()
            .clip(geometry);



var IMG_water = ndwi_f(IMG)
var IMG_NDCI = ndci_f(IMG_water)

var img = IMG_NDCI.select('NDCI');


var viz = {min:0.1,max:0.4,palette:['cyan','orange','red']}

Map.addLayer(IMG,{bands:['B4','B3','B2'],min:0,max:3500},'IMG')
Map.addLayer(IMG_water.select('NDWI'),{palette:['cyan']},"IMG_water")
Map.addLayer(IMG_NDCI.select('NDCI'),viz,"IMG_NDCI")


function ndwi_f(img){

  var ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI');
  return img.addBands(ndwi)
  .updateMask(ndwi.gt(0))
}


function ndci_f(img){

  var ndci = img.normalizedDifference(['B5', 'B4']).rename('NDCI');
  return img.addBands(ndci)
}





var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
 
 

var legendTitle = ui.Label({
  // value: 'chl-a \n (mg/m3)',
  value: 'water quality',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});


legend.add(legendTitle); 


var lon = ee.Image.pixelLonLat().select('latitude');
var gradient = lon.multiply((viz.max-viz.min)/100.0).add(viz.min);
var legendImage = gradient.visualize(viz);


var panel = ui.Panel({
    widgets: [
      ui.Label('polluted')
    ],
  });

legend.add(panel);
  

var thumbnail = ui.Thumbnail({
  image: legendImage, 
  params: {bbox:'0,0,10,100', dimensions:'10x200'},  
  style: {padding: '1px', position: 'bottom-center'}
});


legend.add(thumbnail);


var panel = ui.Panel({
    widgets: [
      ui.Label('normal')
    ],
  });

legend.add(panel);

Map.add(legend);

Export.image.toDrive({
  image: img,
  description: 'ndci_20',
  region: geometry
});
