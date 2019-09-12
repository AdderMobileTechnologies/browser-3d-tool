scope.setState(
  prevState => ({
    ...prevState,
    userSession: {
      ...prevState.userSession,
      designModel: {
          ...prevState.userSession.designModel ,
          designName:
      }
    }
  }),
  () => {}
);

//state.userSession.designModel.designName
