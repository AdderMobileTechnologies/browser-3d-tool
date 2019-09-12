scope.setState(
  prevState => ({
    ...prevState,
    userSession: {
      ...prevState.userSession,
      designs: newDesignsArray,
      savedDesigns: newDesignsArray
    }
  }),
  () => {}
);
//state.userSession.designModel.designName
