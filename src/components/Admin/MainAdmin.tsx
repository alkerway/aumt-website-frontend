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
import db from '../../services/db'
import { stringify } from 'querystring';


interface MainAdminProps extends RouteComponentProps {
}

interface MainAdminState {
    editingTrainingData: AumtWeeklyTraining | null
    editingEventData: AumtEvent | null
    menuOpen: boolean
    trainingForms: AumtWeeklyTraining[]
    formDbListenerId: string
    currentSelectedAdmin: string
}

class MainAdmin extends Component<MainAdminProps, MainAdminState> {
    private historyListener: null | Function = null;
    private isFirstTrainingListen = true
    
    constructor(props: MainAdminProps) {
        super(props)
        this.state = {
            editingTrainingData: null,
            editingEventData: null,
            menuOpen: false,
            trainingForms: [],
            formDbListenerId: '',
            currentSelectedAdmin: 'trainings'
        }
        this.historyListener = null
    }

    componentDidMount = () => {
        this.historyListener = this.props.history.listen(this.onRouteChange);
        this.setStateFromPathChange(window.location.pathname)
    }

    componentWillUnmount = () => {
      if (this.historyListener) {
        this.historyListener()
      }
      if (this.state.formDbListenerId) {
        db.unlisten(this.state.formDbListenerId)
      }
    }

    onRouteChange = (location: any, action: string) => {
        this.setStateFromPathChange(location.pathname)
    }

    onFormsFirstLoaded = (forms: AumtWeeklyTraining[]) => {
        this.setState({
            ...this.state,
            trainingForms: forms.sort((a, b) => a.closes < b.closes ? 1 : -1),
            formDbListenerId: db.listenToTrainings(this.onTrainingDbChanges)
        })
    }

    onTrainingDbChanges = (forms: AumtWeeklyTraining[]) => {
        if (!this.isFirstTrainingListen && forms && forms.length) {
            const sortedForms = forms.sort((a, b) => {
                return a.closes < b.closes ? 1 : -1
            })
            this.setState({
                ...this.state,
                trainingForms: sortedForms
            })
        }
        this.isFirstTrainingListen = false
    }

    setStateFromPathChange = (windowPath: string) => {
        const pathname = windowPath
        let currentSelectedAdmin = 'trainings'
        if (pathname.indexOf('/admin/events') > -1 || pathname.indexOf('/admin/createevent') > -1) {
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

    onEditTrainingRequest = (data: AumtWeeklyTraining) => {
        this.setState({...this.state, editingTrainingData: data}, () => {
            this.props.history.push(`/admin/edittraining/${data.trainingId}`)
        })
    }
    onEditEventRequest = (data: AumtEvent) => {
        this.setState({...this.state, editingEventData: data}, () => {
            this.props.history.push(`/admin/editevent/${data.id}`)
        })
    }

    onCreateTrainingSubmit = (trainingData: AumtWeeklyTraining): Promise<void> => {
        return db.submitNewForm(trainingData)
    }

    onCreateEventSubmit = (eventData: AumtEvent): Promise<void> => {
        return db.submitEvent(eventData)
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
                        <Route path='/admin/events'>
                            <div className="manageEventsContainer">
                                <div className="mainAdminEventsHeader">
                                    <h2 className="createEventTitle manageEventTitle">Manage Events</h2>
                                    <Link to='/admin/createevent' className='mainAdminCreateEventButton'>
                                        <Button type='primary' size='large' shape='round'>Create Event <PlusOutlined /></Button>
                                    </Link>
                                    <div className="clearBoth"></div>
                                </div>
                                <ManageEvents onEditEventRequest={this.onEditEventRequest}></ManageEvents>
                            </div>
                        </Route>
                        <Route path='/admin/members'>
                            <MemberDashboard></MemberDashboard>
                        </Route>
                        <Route path='/admin/feedback'>
                            <Feedback></Feedback>
                        </Route>
                        <Route path='/admin/createtraining'>
                            <div className="mainAdminCreateFormContainer">
                                <h2 className='createTrainingTitle'>
                                    <Link className='mainAdminCreateBack' to='/admin'>
                                        <ArrowLeftOutlined />
                                    </Link>
                                    Create Training</h2>
                                <CreateTraining onCreateSubmit={this.onCreateTrainingSubmit}></CreateTraining>
                            </div>
                        </Route>
                        <Route path='/admin/createevent'>
                            <div className="mainAdminCreateFormContainer">
                                <h2 className="createTrainingTitle">
                                    <Link className='mainAdminCreateBack' to='/admin/events'>
                                        <ArrowLeftOutlined />
                                    </Link>
                                    Create Event</h2>
                                <CreateEvent onCreateEventSubmit={this.onCreateEventSubmit}></CreateEvent>
                            </div>
                        </Route>
                        <Route path='/admin/edittraining/:trainingid'>
                            <div className="mainAdminCreateFormContainer">
                                {this.state.editingTrainingData ?
                                <div>
                                    <h2 className='createTrainingTitle'>
                                        <Link className='mainAdminCreateBack' to='/admin'>
                                            <ArrowLeftOutlined />
                                        </Link>
                                        Edit {this.state.editingTrainingData.title} </h2>
                                    <CreateTraining
                                        defaultValues={this.state.editingTrainingData}
                                        onCreateSubmit={this.onCreateTrainingSubmit}></CreateTraining>
                                </div>:
                                        <Redirect to='/admin/trainings/'/>}
                            </div>
                        </Route>
                        <Route path='/admin/editevent/:eventId'>
                            <div className="mainAdminCreateFormContainer">
                                {this.state.editingEventData ?
                                <div>
                                    <h2 className='createTrainingTitle'>
                                        <Link className='mainAdminCreateBack' to='/admin/events'>
                                            <ArrowLeftOutlined />
                                        </Link>
                                    Edit {this.state.editingEventData.title} </h2>
                                    <CreateEvent
                                        defaultValues={this.state.editingEventData}
                                        onCreateEventSubmit={this.onCreateEventSubmit}></CreateEvent>
                                </div>:
                                        <Redirect to='/admin/events/'/>}
                            </div>
                        </Route>
                        <Route path='/admin'>
                            <TrainingDashboard
                                onFormsLoaded={this.onFormsFirstLoaded}
                                dbForms={this.state.trainingForms}
                                onEditTrainingRequest={this.onEditTrainingRequest}></TrainingDashboard>
                        </Route>
                    </Switch>
                </div>
            </div>
        )
    }
}

export default withRouter(MainAdmin)