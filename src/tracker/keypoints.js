(function (window, undefined) {

    tracking.type.KEYPOINTS = {

        NAME: 'KEYPOINTS',

        defaults: {

            fastBlockSize: 8,

            fastThreshold: 10

        },


        /*
         * FAST: Features from Accelerated Segment Test
         *
         * This method performs a point segment test corner detection. The
         * segment test criterion operates by considering a circle of sixteen
         * pixels around the corner candidate p. The detector classifies p as a
         * corner if there exists a set of n contiguous pixelsin the circle
         * which are all brighter than the intensity of the candidate pixel
         * Ip plus a threshold t, or all darker than Ip − t.
         *
         * For more reference:
         * http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.60.3991&rep=rep1&type=pdf
         */
        Fast9: {
            /*       15 00 01
             *    14          02
             * 13                03
             * 12       []       04
             * 11                05
             *    10          06
             *       09 08 07
             */
            isCorner: function(p, w, i, j, data, width, height) {
                var instance = this,

                    threshold = instance.defaults.fastThreshold,

                    brighter,
                    circle,
                    darker,
                    ip,
                    overlap,
                    wip,
                    x,
                    y;

                if (i <= 3 && j <= 3) {
                    return false;
                }

                circle = [
                    (i-3)*width + (j),
                    (i-3)*width + (j+1),
                    (i-2)*width + (j+2),
                    (i-1)*width + (j+3),
                    (i)*width + (j+3),
                    (i+1)*width + (j+3),
                    (i+2)*width + (j+2),
                    (i+3)*width + (j+1),
                    (i+3)*width + (j),
                    (i+3)*width + (j-1),
                    (i+2)*width + (j-2),
                    (i+1)*width + (j-3),
                    (i)*width + (j-3),
                    (i-1)*width + (j-3),
                    (i-2)*width + (j-2),
                    (i-3)*width + (j-1)
                ];

                for (x = 0; x < 16; x++) {
                    darker = true;
                    brighter = true;

                    for (y = 0; y < 9; y++) {
                        overlap = (x + y)%16;
                        wip = circle[overlap];
                        ip = data[wip];

                        if ((ip >= (p + threshold)) === false) {
                            brighter = false;
                        }

                        if ((ip <= (p - threshold)) === false) {
                            darker = false;
                        }
                    }
                }

                return brighter || darker;
            }
        },

        track: function(trackerGroup, video) {
            var instance = this,
                defaults = instance.defaults,
                isCorner = instance.Fast9.isCorner,
                total = 0,
                pixels = [],
                payload,
                height = video.canvas.get('height'),
                width = video.canvas.get('width'),
                data = new Uint8ClampedArray(width*height),
                p,
                w = 0,
                i = 0,
                j = 0;

            video.syncVideoCanvas();

            video.canvas.transform(function(r, g, b, a, w) {
                p = r*0.299 + b*0.587 + g*0.114;

                data[w++] = p;

                return [ p, p, p, a ];
            });

            for (i = 0; i < height; i++) {
                for (j = 0; j < width; j++) {
                    w = i*width + j;
                    p = data[w];

                    if (isCorner.call(instance, p, w, i, j, data, width, height)) {
                        total += 2;
                        pixels.push(j, i);

                        video.canvas.context.fillStyle = "rgb(0,255,255)";
                        video.canvas.context.fillRect(j, i, 1, 1);
                    }
                }
            }


            // imageData = video.getVideoCanvasImageData();
            // data = imageData.data;

            // video.canvas.forEach(
            //     imageData,
            //     function pixelMatrixLoop(r, g, b, a, w, i, j) {

            //         for (c = -1; (config = trackerGroup[++c]); ) {
            //             if (!pixels[c]) {
            //                 total[c] = 0;
            //                 pixels[c] = [];
            //             }

            //             if (isCorner.call(instance, r, g, b, a, w, i, j, data, width, height)) {
            //                 total[c] += 2;
            //                 pixels[c].push(j, i);
            //             }
            //         }

            //     }
            // );
        }

    };

}( window ));