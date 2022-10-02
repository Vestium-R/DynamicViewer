# DynamicViewer

This is a module for displaying a dynamic picture in picture elements on a battlemap scene that is being loaded. This module is intended to be used in conjunction with the Beneos Battlemaps but will support a variety of both animated and non-animated maps.


For Animated maps:

When moving to a battlemap it will check the conditions in the module setting - if the filename matches any of the conditions it will check for a matching "scene" file (a file that matches the exact name of the battlemap with _Scen in the file name. If it can find one it will do the following:

Create a journal entry with the embedded scene video (depending on settings)

Share the journal entry (depending on settings)

Create a picture in a picture frame with the video scene embedded (to either players or GM only depending on settings)

**For non-webm maps:
**
It will do the following:

Create a journal entry with the embedded scene video (depending on settings)
Share the journal entry (depending on settings)

![image](https://user-images.githubusercontent.com/78631300/193439488-a42a18d1-81fe-4f01-b6b4-5645c1148aa7.png)


Scene navigation quick exclusion:

![image](https://user-images.githubusercontent.com/78631300/193439504-28aece89-96eb-4f40-b1f6-267f711b9413.png)

Journal Entry quick exclusion:

![image](https://user-images.githubusercontent.com/78631300/193439540-63a2ac7d-50ba-4ed3-9510-3cc691aa7065.png)

Note* This module was originally designed for Beneos Animated Battlemaps but will work with any animated files. Can also work as a standalone automatic journal creator for your players. To do this simply include a matching _Scen file in the folder where your battlemap lives. IE: Castle_BM.jpg + Castle_Scen.jpg will create a journal entry with the contents of Castle_Scen in it.
