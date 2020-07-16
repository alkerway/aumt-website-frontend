import React, {Component} from 'react'
import { Switch, Route, Link, withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Menu, Button, Drawer } from 'antd'
import { PlusOutlined, ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons'
import CreateTraining from './Trainings/CreateTraining'
import CreateEvent from './Events/CreateEvent'
import {ManageEvents} from './Events/ManageEvents'
import './MainAdmin.css'
import { TrainingDashboard } from './Trainings/TrainingDashboard'
import { Feedback } from './Feedback/Feedback';
import MemberDashboard from './Members/MemberDashboard'
import { AumtEvent, AumtWeeklyTraining } from '../../types'
import AdminStore from './AdminStore';
import EventSignups from './Events/EventSignups';


interface MainAdminProps extends RouteComponentProps {
}

interface MainAdminState {
    menuOpen: boolean
    currentSelectedAdmin: string
    forms: AumtWeeklyTraining[]
    events: AumtEvent[]
}

class MainAdmin extends Component<MainAdminProps, MainAdminState> {
    private routeChangeListener: null | Function = null;
    constructor(props: MainAdminProps) {
        super(props)
        this.state = {
            menuOpen: false,
            currentSelectedAdmin: 'trainings',
            forms: [],
            events: []
        }
        AdminStore.addListeners(this.handleNewForms, this.handleNewEvents)
        this.routeChangeListener = null
    }

    componentDidMount = () => {
        this.routeChangeListener = this.props.history.listen(this.onRouteChange);
        this.setStateFromPathChange(window.location.pathname)
    }

    componentWillUnmount = () => {
      if (this.routeChangeListener) {
        this.routeChangeListener()
      }
      AdminStore.cleanup()
    }

    handleNewForms = (forms: AumtWeeklyTraining[]) => {
        this.setState({ ...this.state, forms })
    }

    handleNewEvents = (events: AumtEvent[]) => {
        this.setState({...this.state, events})
    }

    onRouteChange = (location: any, action: string) => {
        this.setStateFromPathChange(location.pathname)
    }

    setStateFromPathChange = (windowPath: string) => {
        const pathname = windowPath
        let currentSelectedAdmin = 'trainings'
        if (pathname.indexOf('/admin/events') > -1
            || pathname.indexOf('/admin/createevent') > -1
            || pathname.indexOf('/admin/editevent') > -1
            ) {
            currentSelectedAdmin = 'events'
        } else if (pathname.indexOf('/admin/members') > -1) {
            currentSelectedAdmin = 'members'
        } else if (pathname.indexOf('/admin/feedback') > -1) {
            currentSelectedAdmin = 'feedback'
        }
        this.setState({
            ...this.state,
            currentSelectedAdmin
        })
    }

    setMenuOpen = (open: boolean) => {
        this.setState({...this.state, menuOpen: open})
    }

    handleMenuClick = (e: {key: string}) => {
        this.setState({
          currentSelectedAdmin: e.key,
        });
      };

    getMenu = () => {
        return (
            <Menu className='adminMenu' onClick={this.handleMenuClick}
                selectedKeys={[this.state.currentSelectedAdmin]}
                >
                <Menu.Item key="trainings">
                    <Link to='/admin'>Trainings</Link>
                </Menu.Item>
                <Menu.Item key="events">
                    <Link to='/admin/events'>Events</Link>
                </Menu.Item>
                <Menu.Item key="members">
                    <Link to='/admin/members'>Members</Link>
                </Menu.Item>
                <Menu.Item key="feedback">
                    <Link to='/admin/feedback'>Feedback</Link>
                </Menu.Item>
            </Menu>
        )
    }

    render() {
        return (
            <div className='adminContainer'>
                {window.innerWidth < 1180 ? 
                <div className="openMenuButton">
                    <Button onClick={e => this.setMenuOpen(true)}><MenuOutlined />Admin</Button>
                    <Drawer placement='left' visible={this.state.menuOpen} onClose={e => this.setMenuOpen(false)}>
                        {this.getMenu()}
                    </Drawer>
                </div>
                :
                <div className="adminMenu">
                    {this.getMenu()}
                </div>}
                <div className="adminContent">
                    <Switch>
                        <Route path='/admin/events/:id'>
                            <EventSignups events={this.state.events}></EventSignups>
                        </Route>
                        <Route path='/admin/events'>
                            <div className="manageEventsContainer">
                                <div className="mainAdminEventsHeader">
                                    <h2 className="createEventTitle manageEventTitle">Manage Events</h2>
                                    <Link to='/admin/createevent' className='mainAdminCreateEventButton'>
                                        <Button type='primary' size='large' shape='round'>Create Event <PlusOutlined /></Button>
                                    </Link>
                                    <div className="clearBoth"></div>
                                </div>
                                <ManageEvents events={this.state.events}></ManageEvents>
                            </div>
                        </Route>
                        <Route path='/admin/members'>
                            <MemberDashboard></MemberDashboard>
                        </Route>
                        <Route path='/admin/feedback'>
                            <Feedback forms={this.state.forms}></Feedback>
                        </Route>
                        <Route path='/admin/createtraining'>
                            <div className="mainAdminCreateFormContainer">
                                <h2 className='createTrainingTitle'>
                                    <Link className='mainAdminCreateBack' to='/admin'>
                                        <ArrowLeftOutlined />
                                    </Link>
                                    Create Training</h2>
                                <CreateTraining></CreateTraining>
                            </div>
                        </Route>
                        <Route path='/admin/createevent'>
                            <div className="mainAdminCreateFormContainer">
                                <h2 className="createTrainingTitle">
                                    <Link className='mainAdminCreateBack' to='/admin/events'>
                                        <ArrowLeftOutlined />
                                    </Link>
                                    Create Event</h2>
                                <CreateEvent></CreateEvent>
                            </div>
                        </Route>
                        <Route path='/admin/edittraining/:trainingid'>
                            <div className="mainAdminCreateFormContainer">
                                <div>
                                    <h2 className='createTrainingTitle'>
                                        <Link className='mainAdminCreateBack' to='/admin'>
                                            <ArrowLeftOutlined />
                                        </Link>
                                        Edit</h2>
                                    <CreateTraining></CreateTraining>
                                </div>
                            </div>
                        </Route>
                        <Route path='/admin/editevent/:eventId'>
                            <div className="mainAdminCreateFormContainer">
                                <div>
                                    <h2 className='createTrainingTitle'>
                                        <Link className='mainAdminCreateBack' to='/admin/events'>
                                            <ArrowLeftOutlined />
                                        </Link>
                                    Edit Event</h2>
                                    <CreateEvent></CreateEvent>
                                </div>
                            </div>
                        </Route>
                        <Route path='/admin'>
                            <TrainingDashboard
                                forms={this.state.forms}
                                ></TrainingDashboard>
                        </Route>
                    </Switch>
                </div>
            </div>
        )
    }
}

export default withRouter(MainAdmin)