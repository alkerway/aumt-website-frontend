import React, { Component } from 'react'
import * as firebase from "firebase/app";
import { User } from 'firebase/app'
import 'firebase/auth';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Header } from './Header/Header'
import LoginForm from './Header/LoginForm'
import About from './Content/About'
import Signups from './Content/Signups'
import Faq from './Content/Faq'
import './Aumt.css'

export interface AumtProps {

}

export interface AumtState {
    authedUser: User | null
}

export class Aumt extends Component<AumtProps, AumtState> {
    constructor(props: AumtProps) {
        super(props)
        let authedUser = null
        const firebaseConfig = {
          apiKey: "AIzaSyCiKKNhuZ7eUl8gnSFWpg2bH7bLLP8-jZ4",
          authDomain: "aumt-website.firebaseapp.com",
          databaseURL: "https://aumt-website.firebaseio.com",
          projectId: "aumt-website",
          storageBucket: "aumt-website.appspot.com",
          messagingSenderId: "736095768201",
          appId: "1:736095768201:web:bac85c7f6d0eb16d7a4058"
        }
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.state = { authedUser }
        firebase.auth().onAuthStateChanged((user: User | null) => {
            this.setState({
                authedUser: user
            })
        });
    }

    render() {
        return (
            <div className="App">
              <BrowserRouter>
                <Switch>
                  <Route path="/login">
                    <LoginForm></LoginForm>
                  </Route>
                  <Route path="/*">
                    <Header authedUser={this.state.authedUser}></Header>
                    <Switch>
                      <Route path="/about">
                        <Redirect to='/'/>
                      </Route>
                      <Route path="/signups">
                        {this.state.authedUser ?  <Signups authedUser={this.state.authedUser } /> : <p> You must sign in to be able to sign up for trainings! </p>}
                      </Route>
                      <Route path="/events">
                        <p>Events page coming soon! </p>
                      </Route>
                      <Route path="/faq">
                        <Faq></Faq>
                      </Route>
                      <Route path="/">
                        <About></About>
                      </Route>
                    </Switch>
                  </Route>
                </Switch>
              </BrowserRouter>
            </div>
          );
    }
}