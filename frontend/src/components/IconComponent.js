import React from 'react';
import foodIcon from '../icons/foodIcon.png';
import geographyIcon from '../icons/geographyIcon.png';
import historyIcon from '../icons/historyIcon.png';
import itIcon from '../icons/itIcon.png';
import languageIcon from '../icons/languageIcon.png';
import musicIcon from '../icons/musicIcon.png';
import movieIcon from '../icons/movieIcon.png';
import litteratureIcon from '../icons/litteratureIcon.png';
import politicsIcon from '../icons/politicsIcon.png';
import scienceIcon from '../icons/scienceIcon.png';
import sportIcon from '../icons/sportIcon.png';
import wheelIcon from '../icons/wheelIcon.png';
import religionIcon from '../icons/religionIcon.png';
import artIcon from '../icons/artIcon.png';
import cultureIcon from '../icons/cultureIcon.png';







var iconList = {}; 
iconList["foodIcon"] = foodIcon;
iconList["geographyIcon"] = geographyIcon;
iconList["historyIcon"] = historyIcon;
iconList["itIcon"] = itIcon;
iconList["languageIcon"] = languageIcon;
iconList["musicIcon"] = musicIcon;
iconList["movieIcon"] = movieIcon;
iconList["litteratureIcon"] = litteratureIcon;
iconList["politicsIcon"] = politicsIcon;
iconList["sportIcon"] = sportIcon;
iconList["scienceIcon"] = scienceIcon;
iconList["sportIcon"] = sportIcon;
iconList["scienceIcon"] = scienceIcon;
iconList["wheelIcon"] = wheelIcon;
iconList["religionIcon"] = religionIcon;
iconList["artIcon"] = artIcon;
iconList["cultureIcon"] = cultureIcon;





const IconComponent = ({ imageName }) => {
  
  return (
    <div className="icon-container">
      <img src={iconList[imageName]} alt={imageName} className="icon-image"/>
    </div>
  );
};

export default IconComponent;
