import React, { useRef, useEffect } from 'react';
import ClanBannerManifest from '../modules/raws/ClanBannerManifest.json';

const ClanBannerGenerator = props => {
  let ClanBanner;
  const gonfalonRef = useRef(null);
  const detailRef = useRef(null);
  const decalBgRef = useRef(null);
  const decalFgRef = useRef(null);
  const staffRef = useRef(null);

  if(props.clanBanner) {
    ClanBanner = {
      staff: { imagePath: "/images/clan_banner/staves/default.png" },
      gonfalon: {
        imagePath: "/images/clan_banner/gonfalons/cb_gonfalon_f6fada502c393950662df87b131bbb6f.png",
        color: ClanBannerManifest.gonfalonColors.find(e => e.colorHash === props.clanBanner.gonfalonColorId)
      },
      decal: {
        foregroundImagePath: ClanBannerManifest.decals.find(e => e.imageHash === props.clanBanner.decalId)?.foregroundImagePath,
        backgroundImagePath: ClanBannerManifest.decals.find(e => e.imageHash === props.clanBanner.decalId)?.backgroundImagePath,
        foregroundColor: ClanBannerManifest.decalPrimaryColors.find(e => e.colorHash === props.clanBanner.decalColorId),
        backgroundColor: ClanBannerManifest.decalSecondaryColors.find(e => e.colorHash === props.clanBanner.decalBackgroundColorId)
      },
      detail: {
        imagePath: ClanBannerManifest.gonfalonDetails.find(e => e.imageHash === props.clanBanner.gonfalonDetailId)?.foregroundImagePath,
        color: ClanBannerManifest.gonfalonDetailColors.find(e => e.colorHash === props.clanBanner.gonfalonDetailColorId)
      }
    }
  }
  else {
    ClanBanner = {
      staff: { imagePath: "/images/clan_banner/staves/default.png" },
      gonfalon: {
        imagePath: "/images/clan_banner/gonfalons/cb_gonfalon_f6fada502c393950662df87b131bbb6f.png",
        color: { "colorHash": 0, "red": 255, "green": 255, "blue": 255, "alpha": 255 }
      }
    }
  }
  
  useEffect(async () => {
    const getColor = (data) => {
      if(data) { return `rgba(${ data.red },${ data.green },${ data.blue },${ data.alpha })`; }
      else { return `rgba(255,255,255,1)`; }
    };
    const gonfalon = gonfalonRef.current; const ctxGonfalon = gonfalon.getContext('2d');
    const detail = detailRef.current; const ctxDetail = detail.getContext('2d');
    const decalFg = decalFgRef.current; const ctxDecalFg = decalFg.getContext('2d');
    const decalBg = decalBgRef.current; const ctxDecalBg = decalBg.getContext('2d');
    const staff = staffRef.current; const ctxStaff = staff.getContext('2d');
    
    //loadImages
    const staffImage = new Image();
    const gonfalonImage = new Image();
    const detailImage = new Image();
    const decalFgImage = new Image();
    const decalBgImage = new Image();

    if(props.clanBanner) {
      gonfalonImage.src = ClanBanner.gonfalon.imagePath;
      detailImage.src = ClanBanner.detail.imagePath;
      decalFgImage.src = ClanBanner.decal.foregroundImagePath;
      decalBgImage.src = ClanBanner.decal.backgroundImagePath;

      gonfalonImage.onload = () => {
        ctxGonfalon.drawImage(gonfalonImage, 0, 0, ctxGonfalon.canvas.width, ctxGonfalon.canvas.height);
        ctxGonfalon.globalCompositeOperation = 'source-in';
        ctxGonfalon.fillStyle = getColor(ClanBanner.gonfalon.color);
        ctxGonfalon.fillRect(0, 0, ctxGonfalon.canvas.width, ctxGonfalon.canvas.height);
      };

      detailImage.onload = () => {
        ctxDetail.drawImage(detailImage, 0, 0, ctxDetail.canvas.width, ctxDetail.canvas.height);
        ctxDetail.globalCompositeOperation = 'source-in';
        ctxDetail.fillStyle = getColor(ClanBanner.detail.color);
        ctxDetail.fillRect(0, 0, ctxDetail.canvas.width, ctxDetail.canvas.height);
      };
  
      decalFgImage.onload = () => {
        ctxDecalFg.drawImage(decalFgImage, 0, 0, ctxDecalFg.canvas.width, ctxDecalFg.canvas.height);
        ctxDecalFg.globalCompositeOperation = 'source-in';
        ctxDecalFg.fillStyle = getColor(ClanBanner.decal.foregroundColor);
        ctxDecalFg.fillRect(0, 0, ctxDecalFg.canvas.width, ctxDecalFg.canvas.height);
      };
  
      decalBgImage.onload = () => {
        ctxDecalBg.drawImage(decalBgImage, 0, 0, ctxDecalBg.canvas.width, ctxDecalBg.canvas.height);
        ctxDecalBg.globalCompositeOperation = 'source-in';
        ctxDecalBg.fillStyle = getColor(ClanBanner.decal.backgroundColor);
        ctxDecalBg.fillRect(0, 0, ctxDecalBg.canvas.width, ctxDecalBg.canvas.height);
      };
    }

    staffImage.src = ClanBanner.staff.imagePath;
    staffImage.onload = () => {
      ctxStaff.drawImage(staffImage, 0, 0, ctxStaff.canvas.width, ctxStaff.canvas.height);
      ctxStaff.globalCompositeOperation = 'source-atop';
    };
  }, [])
  
  return (
    <div className="clan-banner-icon">
      <canvas ref={gonfalonRef} width="45px" height="60px" style={{ position: "absolute", top: "6px", left: "7px" }} />
      <canvas ref={detailRef} width="45px" height="60px" style={{ position: "absolute", top: "6px", left: "7px" }} />
      <canvas ref={decalBgRef} width="45px" height="60px" style={{ position: "absolute", top: "6px", left: "7px" }} />
      <canvas ref={decalFgRef} width="45px" height="60px" style={{ position: "absolute", top: "6px", left: "7px" }} />
      <canvas ref={staffRef} width="45px" height="60px" style={{ position: "absolute", top: "6px", left: "7px" }} />
    </div>
  )
}

export default ClanBannerGenerator