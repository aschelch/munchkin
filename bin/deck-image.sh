#!/bin/sh

#for f in ./*.jpg; do convert $f -auto-orient -crop 2800x1908+0x0 $f; done

for f in ./*.jpg;
do
convert -strip -interlace Plane -auto-orient -resize 800x  -sampling-factor 4:2:0 -quality 60% -colorspace RGB $f optimized/$f
done;