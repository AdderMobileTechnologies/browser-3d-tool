import React from "react";
import UserImage from "../assets/Adder_3D_Tool2/contact_photo.png";
import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";

export const CONSTANT_NUMBER_1 = "hello I am a constant";

export const DefaultUserImage = UserImage;

export const API_URL = "http://localhost:8001";
export const tileData = [
  {
    img: UserImage,
    title: "Breakfast",
    author: "jill111",
    cols: 2,
    featured: true
  },
  {
    img: UserImage,
    title: "Tasty burger",
    author: "director90"
  },
  {
    img: UserImage,
    title: "Camera",
    author: "Danson67"
  }
];
export const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)"
  }
}));
export const UIGridList = props => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {/**   one spot:  tileData={this.state.tileData} */}
      <GridList className={classes.gridList} cols={2.5}>
        {/**
                     {props.tileData.map(tile => (
                        <GridListTile key={tile.img}>
                            <img src={tile.img} alt={tile.title} />
                            <GridListTileBar
                            title={tile.title}
                            classes={{
                                root: classes.titleBar,
                                title: classes.title,
                            }}
                            actionIcon={
                                <IconButton aria-label={`star ${tile.title}`}>
                                <StarBorderIcon className={classes.title} /> 
                                </IconButton>
                            }
                            />
                        </GridListTile>
                        ))}
                     */}
      </GridList>
    </div>
  );
};
