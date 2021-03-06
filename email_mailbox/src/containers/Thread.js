import { connect } from 'react-redux';
import {
  addLabelIdThread,
  loadEmails,
  removeLabelIdThread,
  sendOpenEvent
} from '../actions';
import { reportPhishing } from '../utils/ipc';
import { parseContactRow } from '../utils/EmailUtils';
import { matchOwnEmail } from '../utils/ContactUtils';
import { makeGetEmails } from './../selectors/emails';
import { makeGetLabels } from './../selectors/labels';
import { makeGetThread } from './../selectors/threads';
import ThreadView from '../components/Thread';
import { LabelType, myAccount } from '../utils/electronInterface';
import { SectionType } from '../utils/const';

const makeMapStateToProps = () => {
  const getEmails = makeGetEmails();
  const getLabels = makeGetLabels();
  const getThread = makeGetThread();

  const mapStateToProps = (state, ownProps) => {
    const thread = getThread(state, ownProps);
    const mailbox = state.get('threads').get(`${ownProps.mailboxSelected.id}`);
    const threads = mailbox ? Array.from(mailbox.get('list')) : [];
    const emailIds = thread ? thread.emailIds : [];
    const { emails, emailKeysUnread, emailsUnread } = getEmails(state, {
      emailIds
    });
    const indexFirstUnread = emails.findIndex(email => email.unread);
    const labelIds = thread ? thread.allLabels : [];
    const labels = thread ? getLabels(state, { labelIds }) : [];
    const starred = thread
      ? thread.allLabels.includes(LabelType.starred.id)
      : undefined;
    const threadIds = threads.map(thread => thread.toJS().uniqueId);
    const threadId = thread ? threadIds.indexOf(thread.threadId) : -1;
    const isFirstThread =
      thread && thread.threadId === threadIds[0] ? true : false;
    const isLastThread =
      thread && thread.threadId === threadIds[threadIds.length - 1]
        ? true
        : false;
    const nextThread =
      thread && !isLastThread ? threads[threadId + 1].toJS() : null;
    const previousThread =
      thread && !isFirstThread ? threads[threadId - 1].toJS() : null;
    return {
      emailKeysUnread,
      emails,
      emailsUnread,
      indexFirstUnread,
      labels,
      starred,
      thread,
      isFirstThread,
      isLastThread,
      nextThread,
      previousThread
    };
  };
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: emailIds => {
      dispatch(loadEmails({ emailIds }));
    },
    onRemoveLabelIdThread: (thread, labelId) => {
      const threadId = thread.threadId;
      if (labelId === LabelType.spam.id) {
        const notspamEmails = thread.fromContactName
          .map(fromAddress => {
            return parseContactRow(fromAddress).email;
          })
          .filter(fromEmail => {
            return !matchOwnEmail(myAccount.recipientId, fromEmail);
          });
        const params = {
          emails: notspamEmails,
          type: 'notspam'
        };
        reportPhishing(params);
      }
      dispatch(
        removeLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
      );
    },
    onToggleStar: (thread, isStarred) => {
      const threadId = thread.threadId;
      const labelId = LabelType.starred.id;
      if (isStarred) {
        dispatch(
          removeLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
        );
      } else {
        dispatch(
          addLabelIdThread(ownProps.mailboxSelected.id, threadId, labelId)
        );
      }
    },
    onUpdateUnreadEmails: (emailKeysUnread, emailsUnread, threadId) => {
      if (emailKeysUnread.length) {
        const labelId = ownProps.mailboxSelected.id;
        dispatch(
          sendOpenEvent(emailKeysUnread, emailsUnread, threadId, labelId)
        );
      }
    },
    onSelectThread: thread => {
      const threadIdDb = thread.threadId;
      const type = SectionType.THREAD;
      const params = {
        mailboxSelected: ownProps.mailboxSelected,
        threadIdSelected: threadIdDb
      };
      ownProps.onClickSelectedItem(type, params);
    }
  };
};

const Thread = connect(makeMapStateToProps, mapDispatchToProps)(ThreadView);

export default Thread;
