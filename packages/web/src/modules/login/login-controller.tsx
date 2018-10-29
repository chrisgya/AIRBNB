import * as React from 'react';
import { graphql, ChildMutateProps, WithApolloClient, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { LoginMutation, LoginMutationVariables } from '../../schemaTypes';
import { normalizeErrors } from '../shared/normalizeErrors';
import { INormalizedErrorMap } from '../types/normalizedErrorMap';

interface Props {
  onSessionId?: (sessionId: string) => void;
  children: (
     data: { submit: (values: LoginMutationVariables) => Promise<INormalizedErrorMap | null>}
  ) => JSX.Element | null;
}

 class C extends React.PureComponent<
  ChildMutateProps<
    WithApolloClient<Props>, 
    LoginMutation, 
    LoginMutationVariables>
 > {

  submit = async (values: LoginMutationVariables) => {
    console.log(values);
    const {
      data: {
        login: {errors, sessionId}
      }
    } = await this.props.mutate({ variables: values }) as any;

     console.log('response:', errors, sessionId);

    if (errors) {
      // show errors  
        return normalizeErrors(errors);
    }

    if (sessionId && this.props.onSessionId) {
      this.props.onSessionId(sessionId);
    }

    await this.props.client.resetStore();


    return null;
};

  render() {
    return  this.props.children({ submit: this.submit });  
  }
}

const loginMutation = gql`
mutation LoginMutation($email: String!, $password: String!){
  login(email: $email, password: $password) {
      errors {
        path
        message
      }
      sessionId
    }
}
`;

export const LoginController = graphql<Props, 
LoginMutation, 
LoginMutationVariables>(loginMutation)(withApollo<Props>(C));