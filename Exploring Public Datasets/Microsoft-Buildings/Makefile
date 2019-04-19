OBJECTS = Alabama Alaska Arizona Arkansas California \
Colorado Connecticut Delaware DistrictofColumbia \
Florida Georgia Hawaii Idaho Illinois Indiana \
Iowa Kansas Kentucky Louisiana Maine Maryland \
Massachusetts Michigan Minnesota Mississippi Missouri \
Montana Nebraska Nevada NewHampshire NewJersey \
NewMexico NewYork NorthCarolina NorthDakota Ohio \
Oklahoma Oregon Pennsylvania RhodeIsland \
SouthCarolina SouthDakota Tennessee Texas Utah \
Vermont Virginia Washington WestVirginia Wisconsin \
Wyoming

all: $(OBJECTS)

.PHONY: clean
clean: 
	rm -rf data
	curl -XDELETE http://localhost:9200/ms-buildings

$(OBJECTS): ## Download, clean, and stream into Elasticsearch
	mkdir -p data
	# Download the GeoJSON zip file if it doesn't already exist in `src`
	curl -SL -C - https://usbuildingdata.blob.core.windows.net/usbuildings-v1-1/$@.zip -o data/$@.zip
	# Convert the file to GeoJSON and use jq to convert each feature into a new line
	ogr2ogr -f GeoJSONSeq data/$@.ndjson /vsizip/data/$@.zip
	# Repair self-intersecting geometries that are not compatible with Elasticsearch and
	# stream into Elasticsearch
	node index.js data/$@.ndjson

	