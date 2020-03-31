#!/bin/sh

# mkdir cropped
# for f in ./*.jpg; do convert $f -auto-orient -crop 1908x2800+0+70 cropped/$f; done


mkdir optimized
for f in ./*.jpg;
do
convert -strip -interlace Plane -auto-orient -resize 800x  -sampling-factor 4:2:0 -quality 60% -colorspace RGB $f optimized/$f
done;
