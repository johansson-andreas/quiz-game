import React from 'react';
import foodIcon from '../icons/foodIcon.png';
import geographyIcon from '../icons/geographyIcon.png';
import historyIcon from '../icons/historyIcon.png';
import itIcon from '../icons/itIcon.png';
import languageIcon from '../icons/languageIcon.png';




var iconList = {}; 
iconList["foodIcon"] = foodIcon;
iconList["geographyIcon"] = geographyIcon;
iconList["historyIcon"] = historyIcon;
iconList["itIcon"] = itIcon;
iconList["languageIcon"] = languageIcon;
iconList["itIcon"] = itIcon;
iconList["itIcon"] = itIcon;
iconList["itIcon"] = itIcon;


const IconComponent = ({ imageName }) => {
  return (
    <img src={iconList[imageName]} alt="" width="30" height="30" />
  );
};

export default IconComponent;
