# DynamicViewer

By default this module will:
- When moving to a battlemap it will check the conditions in the module setting - if the filename matches any of the conditions it will check for a matching "scene" file. If it can find one it will do the following:

- Create a journal entry with the embedded scene video (depending on settings)
- Share the journal entry (depending on settings)
- Create a picture in picture frame with the video scene embedded)

![image](https://user-images.githubusercontent.com/78631300/193439488-a42a18d1-81fe-4f01-b6b4-5645c1148aa7.png)


Scene navigation quick exclusion:

![image](https://user-images.githubusercontent.com/78631300/193439504-28aece89-96eb-4f40-b1f6-267f711b9413.png)

Journal Entry quick exclusion:

![image](https://user-images.githubusercontent.com/78631300/193439540-63a2ac7d-50ba-4ed3-9510-3cc691aa7065.png)

Note* This module was originally designed for Beneos Animated Battlemaps but will work with any animated files. Can also work as a standalone automatic journal creator for your players. To do this simply include a matching _Scen file in the folder where your battlemap lives. IE: Castle_BM.jpg + Castle_Scen.jpg will create a journal entry with the contents of Castle_Scen in it.
