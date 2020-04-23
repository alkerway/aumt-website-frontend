import React, {Component} from 'react'
import {Radio, Button, Alert, Tooltip, notification, Input, Tag } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio';
import { SyncOutlined, CheckSquareTwoTone } from '@ant-design/icons'
import './SignupForm.css'
import { AumtTrainingSession, AumtMember } from '../../../types'
import db from '../../../services/db';

export interface SignupFormProps {
    title: string
    id: string
    closes: Date
    sessions: AumtTrainingSession[]
    authedUser: AumtMember
    authedUserId: string
    notes: string
    onSubmit?: () => void
}

interface SignupFormState {
    currentSessionId: string
    currentFeedback: string
    signedUpOption: string
    submittingState: boolean
    errorMessage: string
    removingState: boolean
}

export class SignupForm extends Component<SignupFormProps, SignupFormState> {
    constructor(props: SignupFormProps) {
        super(props)
        this.state = {
            currentSessionId: '',
            currentFeedback: '',
            errorMessage: '',
            signedUpOption: '',
            submittingState: false,
            removingState: false
        }
    }
    componentDidMount() {
        this.checkSignedUp()
    }
    checkSignedUp = () => {
        db.isMemberSignedUpToForm(this.props.authedUserId, this.props.id)
            .then((sessionId: string) => {
                if (sessionId) {
                    this.setState({
                        ...this.state,
                        signedUpOption: sessionId
                    })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error retrieving if already signed up: ' + err
                })
            })
    }
    onOptionChange = (e: RadioChangeEvent) => {
        this.setState({
            ...this.state,
            currentSessionId: e.target.value,
        });
    }
    onFeedbackChange = (feedback: string) => {
        this.setState({
            ...this.state,
            currentFeedback: feedback
        })
    }
    onRemoveClick = () => {
        if (this.state.signedUpOption) {
            this.setState({
                ...this.state,
                removingState: true
            })
            db.removeMemberFromForm(this.props.authedUserId, this.props.id, this.state.signedUpOption)
                .then((sessionId: string) => {
                    this.setState({
                        ...this.state,
                        signedUpOption: '',
                        removingState: false
                    })
                })
                .catch((err) => {
                    notification.error({message: 'Could not remove from training: ' + err.toString()})
                })
        }
    }
    onSubmitClick = () => {
        const optionSelected = this.state.currentSessionId
        this.setState({
            ...this.state,
            errorMessage: '',
            submittingState: true
        })
        const displayName = this.props.authedUser.firstName + 
            (this.props.authedUser.preferredName ? ` "${this.props.authedUser.preferredName}" ` : ' ') +
            this.props.authedUser.lastName

        db.signUserUp(
                this.props.authedUserId,
                displayName,
                new Date(),
                this.props.id,
                optionSelected,
                this.state.currentFeedback)
            .then((res) => {
                this.setState({
                    ...this.state,
                    signedUpOption: optionSelected,
                    submittingState: false,
                })
                if (this.props.onSubmit) {
                    this.props.onSubmit()
                }
            })
            .catch((err) => {
                this.setState({
                    ...this.state,
                    submittingState: false,
                    errorMessage: 'Error signing up: ' + err.toString()
                })
            })
    }
    render() {
        return (
            <div>
                <h2 className="formTitle">{this.props.title}</h2>
                {this.props.notes ?
                    (<div className="trainingNotesContainer">
                        {this.props.notes}
                    </div>) :
                    ''
                }
                <div className="optionsContainer">
                    <Radio.Group className="Group" onChange={this.onOptionChange} value={this.state.currentSessionId}>
                        {this.props.sessions.map((session) => {
                            const isFull = session.limit <= Object.keys(session.members).length
                            const spotsLeft = Math.max(0, session.limit - Object.keys(session.members).length)
                            return (
                                <div key={session.title} className="optionLine">
                                    <Tooltip title={isFull ? 'Class full' : ''} placement='left'>
                                        <Radio
                                            className='sessionOption'
                                            disabled={isFull}
                                            value={session.sessionId}>{session.title}
                                        </Radio> 
                                    </Tooltip>
                                        {spotsLeft < 10 ? <Tag color={spotsLeft === 0 ? 'error' : 'warning'}>{spotsLeft} spots left</Tag> : ''}
                                        {this.state.signedUpOption === session.sessionId ? <CheckSquareTwoTone twoToneColor="#52c41a" /> : ''}
                                </div>
                            )
                        })}
                    </Radio.Group>
                </div>
                <div className="feedbackInputContainer">
                    <p>Thoughts on last training/feedback?</p>
                    <Input placeholder='Feedback will be sent anonymously' onChange={e => this.onFeedbackChange(e.target.value)}/>
                </div>
                <div className="messageContainer">
                    {(() => {return this.state.errorMessage ? <Alert type='error' message={this.state.errorMessage}></Alert> : ''})()}
                </div>
                <Button
                    className='signupFormButton'
                    type='primary'
                    size='large'
                    loading={this.state.submittingState}
                    onClick={this.onSubmitClick}>Submit</Button>
                <span className='signupFormRemove' onClick={this.onRemoveClick}>
                    {this.state.removingState ? <span>Removing <SyncOutlined spin/> </span>:'Remove Signup'}
                </span>
            </div>
        )
    }
}