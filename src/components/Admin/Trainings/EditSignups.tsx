import React, {Component} from 'react'
import {Select, Button, Statistic, notification, Dropdown, Menu, Row, Col} from 'antd'
import './EditSignups.css'
import db from '../../../services/db'
import { AumtWeeklyTraining, AumtTrainingSession } from '../../../types'
import { ClickParam } from 'antd/lib/menu'


interface EditSignupsProps {
    form: AumtWeeklyTraining
}

interface EditSignupsState {
    selectedMembers: {
        [sessionId: string]: string
    }
    removingInProcess: {
        [sessionId:string]: boolean
    }
    movingInProcess: {
        [sessionId: string]: boolean
    }
}

export class EditSignups extends Component<EditSignupsProps, EditSignupsState> {
    constructor(props: EditSignupsProps) {
        super(props)
        this.state = {
            selectedMembers: {},
            removingInProcess: {},
            movingInProcess: {}
        }
    }
    onSelectChange = (member: any, sessionId: string) => {
        this.setState({
            ...this.state,
            selectedMembers: Object.assign(this.state.selectedMembers, {
                [sessionId]: member
            })
        })
    }
    memberSort = (uidA: string, uidB: string, session: AumtTrainingSession): number => {
        return session.members[uidA].name > session.members[uidB].name ? 1 : -1
    }
    onRemoveClick = (sessionId: string) => {
        const uidToRemove = this.state.selectedMembers[sessionId]
        if (uidToRemove) {
            this.setState({
                ...this.state,
                removingInProcess: Object.assign(this.state.removingInProcess, {[sessionId]: true})
            })
            db.removeMemberFromForm(uidToRemove, this.props.form.trainingId, sessionId)
                .then(() => {
                    delete this.state.selectedMembers[sessionId]
                    this.setState({
                        ...this.state,
                        removingInProcess: Object.assign(this.state.removingInProcess, {[sessionId]: false})
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error removing member: ' + err.toString()
                    })
                    this.setState({
                        ...this.state,
                        removingInProcess: Object.assign(this.state.removingInProcess, {[sessionId]: false})
                    })
                })
        }
    }
    onMoveClick = (clickParam: ClickParam, fromSession: string) => {
        const {key} = clickParam
        const currentUserIdSelected = this.state.selectedMembers[fromSession]
        const session = this.props.form.sessions.find(s => s.sessionId === fromSession)
        const displayName = session &&
            session.members[currentUserIdSelected] &&
            session.members[currentUserIdSelected].name
        const timeAdded = session &&
            session.members[currentUserIdSelected] &&
            session.members[currentUserIdSelected].timeAdded
        if (!displayName || !timeAdded) {
            return notification.error({
                message: 'No user found for user id ' + currentUserIdSelected + ' in session'
            })
        }
        this.setState({
            ...this.state,
            movingInProcess: Object.assign(this.state.movingInProcess, {
                [fromSession]: true
            })
        })
        db.moveMember(currentUserIdSelected, displayName, timeAdded, this.props.form.trainingId, fromSession, key)
            .then(() => {
                delete this.state.selectedMembers[fromSession]
                this.setState({
                    ...this.state,
                    movingInProcess: Object.assign(this.state.movingInProcess, {[fromSession]: false})
                })
            })
            .catch((err: Error) => {
                this.setState({
                    ...this.state,
                    movingInProcess: Object.assign(this.state.movingInProcess, {[fromSession]: false})
                })
                notification.error({
                    message: err
                })
            })
    }
    getMoveDropdown = (sessionId: string) => {
        const availableMove = this.props.form.sessions.map((session: AumtTrainingSession) => {
            return {
                isSpaceLeft: session.limit >= 0 && Object.keys(session.members).length < session.limit,
                sessionId: session.sessionId,
                title: session.title,
                isCurrentDropdown: session.sessionId === sessionId
            }
        })
        return (
            <Menu onClick={e => this.onMoveClick(e, sessionId)}>
                {availableMove.map((moveObj) => {
                    return (
                        <Menu.Item disabled={moveObj.isCurrentDropdown || !moveObj.isSpaceLeft} key={moveObj.sessionId}>
                            {moveObj.title}{!moveObj.isSpaceLeft ? '(full)' : ''}
                        </Menu.Item>
                        )
                    })
                }
            </Menu>
        )
    }
    render() {
        return (
            <div className='editSignedUpMembersContainer'>
                {this.props.form.sessions.map((session) => {
                    return (
                        <div key={session.sessionId} className="sessionSelectContainer">
                            <Row>
                            <Col span={8} className="editSignupsTitleAndSelect">
                                <div className="weekStatsDisplayWrapper">
                                    <div key={session.sessionId} className="weekStatEachContainer">
                                        <Statistic title={session.title} value={Object.keys(session.members).length} suffix={`/ ${session.limit}`} />
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <Select
                                    showSearch
                                    className='memberSelect'
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    onChange={e => this.onSelectChange(e, session.sessionId)}
                                    >
                                        {Object.keys(session.members).sort((a, b) => this.memberSort(a, b, session)).map((member) => {
                                                return (
                                                <Select.Option key={member} value={member}>{session.members[member].name}{member.indexOf('NONMEMBER') > -1 ? ' (non-member)': ''}</Select.Option>
                                                )
                                        })}
                                </Select>
                            </Col>
                            <Col span={8} className="editSignupsOptionButtons">
                                <Dropdown
                                    disabled={!this.state.selectedMembers[session.sessionId]}
                                    overlay={this.getMoveDropdown(session.sessionId)}
                                    trigger={['click']}>
                                    <Button loading={this.state.movingInProcess[session.sessionId]}
                                        >Move...</Button>
                                </Dropdown>
                                <Button
                                    loading={this.state.removingInProcess[session.sessionId]}
                                    disabled={!this.state.selectedMembers[session.sessionId]}
                                    type='danger'
                                    onClick={e => this.onRemoveClick(session.sessionId)}
                                    >Remove</Button>
                            </Col>
                            </Row>
                        </div>
                    )
                })}
            </div>
        )
    }
}