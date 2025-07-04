// In order to keep file size down, only import the parts of rxjs that we use

import { AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { io, Socket } from 'socket.io-client';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/take';

import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

// Direct Line 3.0 types

export interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string,
    streamUrl?: string,
    referenceGrammarId?: string
}

export type MediaType = "image/png" | "image/jpg" | "image/jpeg" | "image/gif" | "image/svg+xml" | "audio/mpeg" | "audio/mp4" | "video/mp4";

export interface Media {
    contentType: MediaType,
    contentUrl: string,
    name?: string,
    thumbnailUrl?: string
}

export interface UnknownMedia {
    contentType: string,
    contentUrl: string,
    name?: string,
    thumbnailUrl?: string
}

export type CardActionTypes = "openUrl" | "imBack" | "postBack" | "playAudio" | "playVideo" | "showImage" | "downloadFile" | "signin" | "call";

export interface CardAction {
    type: CardActionTypes,
    title: string,
    value: any,
    image?: string
}

export interface CardImage {
    alt?: string,
    url: string,
    tap?: CardAction
}

export interface HeroCard {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: CardImage[],
        buttons?: CardAction[],
        tap?: CardAction
    }
}

export interface Thumbnail {
    contentType: "application/vnd.microsoft.card.thumbnail",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: CardImage[],
        buttons?: CardAction[],
        tap?: CardAction
    }
}

export interface Signin {
    contentType: "application/vnd.microsoft.card.signin",
    content: {
        text?: string,
        buttons?: CardAction[]
    }
}

export interface OAuth {
    contentType: "application/vnd.microsoft.card.oauth",
    content: {
        text?: string,
        connectionname: string,
        buttons?: CardAction[]
    }
}

export interface ReceiptItem {
    title?: string,
    subtitle?: string,
    text?: string,
    image?: CardImage,
    price?: string,
    quantity?: string,
    tap?: CardAction
}

export interface Receipt {
    contentType: "application/vnd.microsoft.card.receipt",
    content: {
        title?: string,
        facts?: { key: string, value: string }[],
        items?: ReceiptItem[],
        tap?: CardAction,
        tax?: string,
        vat?: string,
        total?: string,
        buttons?: CardAction[]
    }
}

// Deprecated format for Skype channels. For testing legacy bots in Emulator only.
export interface FlexCard {
    contentType: "application/vnd.microsoft.card.flex",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: CardImage[],
        buttons?: CardAction[],
        aspect?: string
    }
}

export interface AudioCard {
    contentType: "application/vnd.microsoft.card.audio",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: CardAction[],
        autoloop?: boolean,
        autostart?: boolean
    }
}

export interface VideoCard {
    contentType: "application/vnd.microsoft.card.video",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: CardAction[],
        image?: { url: string, alt?: string },
        autoloop?: boolean,
        autostart?: boolean
    }
}

export interface AdaptiveCard {
    contentType: "application/vnd.microsoft.card.adaptive",
    content: any;
}

export interface AnimationCard {
    contentType: "application/vnd.microsoft.card.animation",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: CardAction[],
        image?: { url: string, alt?: string },
        autoloop?: boolean,
        autostart?: boolean
    }
}

export type KnownMedia = Media | HeroCard | Thumbnail | Signin | OAuth | Receipt | AudioCard | VideoCard | AnimationCard | FlexCard | AdaptiveCard;
export type Attachment = KnownMedia | UnknownMedia;

export type UserRole = "bot" | "channel" | "user";

export interface User {
    id: string,
    name?: string,
    iconUrl?: string,
    role?: UserRole
}

export interface IActivity {
    type: string,
    channelData?: any,
    channelId?: string,
    conversation?: { id: string },
    eTag?: string,
    from: User,
    id?: string,
    timestamp?: string
}

export type AttachmentLayout = "list" | "carousel";

export interface Message extends IActivity {
    type: "message",
    text?: string,
    locale?: string,
    textFormat?: "plain" | "markdown" | "xml",
    attachmentLayout?: AttachmentLayout,
    attachments?: Attachment[],
    entities?: any[],
    suggestedActions?: { actions: CardAction[], to?: string[] },
    speak?: string,
    inputHint?: string,
    value?: object
}

export interface Typing extends IActivity {
    type: "typing"
}

export interface EventActivity extends IActivity {
    type: "event",
    name: string,
    value: any
}

export type Activity = Message | Typing | EventActivity;

interface ActivityGroup {
    activities: Activity[],
    watermark: string
}

// These types are specific to this client library, not to Direct Line 3.0

export enum ConnectionStatus {
    Uninitialized,              // the status when the DirectLine object is first created/constructed
    Connecting,                 // currently trying to connect to the conversation
    Online,                     // successfully connected to the converstaion. Connection is healthy so far as we know.
    ExpiredToken,               // last operation errored out with an expired token. Possibly waiting for someone to supply a new one.
    FailedToConnect,            // the initial attempt to connect to the conversation failed. No recovery possible.
    Ended                       // the bot ended the conversation
}

export interface DirectLineOptions {
    secret?: string,
    token?: string,
    conversationId?: string,
    watermark?: string,
    domain?: string,
    webSocket?: boolean,
    pollingInterval?: number,
    streamUrl?: string,
    params?: any;
    closeSocketConnection: Function;
}

const lifetimeRefreshToken = 30 * 60 * 1000;
const intervalRefreshToken = lifetimeRefreshToken / 2;
const timeout = 20 * 1000;
const retries = (lifetimeRefreshToken - intervalRefreshToken) / timeout;

const errorExpiredToken = new Error("expired token");
const errorConversationEnded = new Error("conversation ended");
const errorFailedToConnect = new Error("failed to connect");

const konsole = {
    log: (message?: any, ...optionalParams: any[]) => {
        if (typeof window !== 'undefined' && (window as any)["botchatDebug"] && message)
            console.log(message, ...optionalParams);
    }
}

export interface IBotConnection {
    connectionStatus$: BehaviorSubject<ConnectionStatus>,
    activity$: Observable<Activity>,
    end(): void,
    referenceGrammarId?: string,
    postActivity(activity: Activity): Observable<string>,
    getSessionId?: () => Observable<string>
}

export class DirectLine implements IBotConnection {
    public connectionStatus$ = new BehaviorSubject(ConnectionStatus.Uninitialized);
    public activity$: Observable<Activity>;
    private params: any;
    private socketConnection: Socket;

    private domain = "https://directline.botframework.com/v3/directline";
    private webSocket: boolean;

    private conversationId: string;
    private secret: string;
    private token: string;
    private watermark = '';
    private streamUrl: string;
    public referenceGrammarId: string;
    private pollingInterval: number = 1000;

    private tokenRefreshSubscription: Subscription;

    constructor(options: DirectLineOptions) {
        this.secret = options.secret;
        this.token = options.secret || options.token;
        this.webSocket = (options.webSocket === undefined ? true : options.webSocket) && typeof WebSocket !== 'undefined' && WebSocket !== undefined;

        if (options.domain) {
            this.domain = options.domain;
        }

        if (options.params) {
            this.params = options.params;
        }

        if (options.conversationId) {
            this.conversationId = options.conversationId;
        }

        if (options.watermark) {
            this.watermark = options.watermark;
        }

        if (options.streamUrl) {
            if (options.token && options.conversationId) {
                this.streamUrl = options.streamUrl;
            } else {
                console.warn('streamUrl was ignored: you need to provide a token and a conversationid');
            }
        }

        if (options.pollingInterval !== undefined) {
            this.pollingInterval = options.pollingInterval;
        }

        this.activity$ = (this.webSocket
            ? this.webSocketActivity$()
            : this.pollingGetActivity$()
        ).share();
    }

    // Every time we're about to make a Direct Line REST call, we call this first to see check the current connection status.
    // Either throws an error (indicating an error state) or emits a null, indicating a (presumably) healthy connection
    private checkConnection(once = false) {
        let obs = this.connectionStatus$
            .flatMap(connectionStatus => {
                if (connectionStatus === ConnectionStatus.Uninitialized) {
                    this.connectionStatus$.next(ConnectionStatus.Connecting);

                    //if token and streamUrl are defined it means reconnect has already been done. Skipping it.
                    if (this.token && this.streamUrl) {
                        this.connectionStatus$.next(ConnectionStatus.Online);
                        return Observable.of(connectionStatus);
                    } else {
                        return this.startConversation().do(conversation => {
                            window.dispatchEvent(new MessageEvent('conversationInit', { data: conversation }));
                            this.conversationId = conversation.conversationId;
                            this.token = this.secret || conversation.token;
                            this.streamUrl = conversation.streamUrl;
                            this.referenceGrammarId = conversation.referenceGrammarId;
                            this.connectionStatus$.next(ConnectionStatus.Online);
                        }, error => {
                            this.connectionStatus$.next(ConnectionStatus.FailedToConnect);
                        }).map(_ => connectionStatus);
                    }
                }
                else {
                    return Observable.of(connectionStatus);
                }
            })
            .filter(connectionStatus => connectionStatus != ConnectionStatus.Uninitialized && connectionStatus != ConnectionStatus.Connecting)
            .flatMap(connectionStatus => {
                switch (connectionStatus) {
                    case ConnectionStatus.Ended:
                        return Observable.throw(errorConversationEnded);

                    case ConnectionStatus.FailedToConnect:
                        return Observable.throw(errorFailedToConnect);

                    case ConnectionStatus.ExpiredToken:
                        return Observable.of(connectionStatus);

                    default:
                        return Observable.of(connectionStatus);
                }
            })

        return once ? obs.take(1) : obs;
    }

    private expiredToken() {
        const connectionStatus = this.connectionStatus$.getValue();
        if (connectionStatus != ConnectionStatus.Ended && connectionStatus != ConnectionStatus.FailedToConnect)
            this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
    }

    private startConversation() {
        //if conversationid is set here, it means we need to call the reconnect api, else it is a new conversation
        const url = this.conversationId
            ? `${this.domain}/conversations/${this.conversationId}?watermark=${this.watermark}`
            : `${this.domain}/conversations`;
        const method = this.conversationId ? "GET" : "POST";

        const request$ = {
            method,
            url,
            timeout,
            headers: {
                "Accept": "application/json",
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${this.token}`
            }
        };

        if (method == 'POST' && this.params) {
            request$['body'] = {
                ...this.params,
            }
        }

        return Observable.ajax(request$)
            .map(ajaxResponse => ajaxResponse.response as Conversation)
            .retryWhen(error$ =>
                // for now we deem 4xx and 5xx errors as unrecoverable
                // for everything else (timeouts), retry for a while
                error$.mergeMap(error => error.status >= 400 && error.status < 600
                    ? Observable.throw(error)
                    : Observable.of(error)
                )
                    .delay(timeout)
                    .take(retries)
            )
    }

    public reconnect(conversation: Conversation) {
        this.token = conversation.token;
        this.streamUrl = conversation.streamUrl;
        if (this.connectionStatus$.getValue() === ConnectionStatus.ExpiredToken)
            this.connectionStatus$.next(ConnectionStatus.Online);
    }

    end() {
        if (this.tokenRefreshSubscription)
            this.tokenRefreshSubscription.unsubscribe();
        this.connectionStatus$.next(ConnectionStatus.Ended);
    }

    getSessionId(): Observable<string> {
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        konsole.log("getSessionId");
        return this.checkConnection(true)
            .flatMap(_ =>
                Observable.ajax({
                    method: "GET",
                    url: `${this.domain}/session/getsessionid`,
                    withCredentials: true,
                    timeout,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.token}`
                    }
                })
                    .map(ajaxResponse => {
                        if (ajaxResponse && ajaxResponse.response && ajaxResponse.response.sessionId) {
                            konsole.log("getSessionId response: " + ajaxResponse.response.sessionId);
                            return ajaxResponse.response.sessionId as string;
                        }
                        return '';
                    })
                    .catch(error => {
                        konsole.log("getSessionId error: " + error.status);
                        return Observable.of('');
                    })
            )
            .catch(error => this.catchExpiredToken(error));
    }

    postActivity(activity: Activity) {
        // Use postMessageWithAttachments for messages with attachments that are local files (e.g. an image to upload)
        // Technically we could use it for *all* activities, but postActivity is much lighter weight
        // So, since WebChat is partially a reference implementation of Direct Line, we implement both.
        if (activity.type === "message" && activity.attachments && activity.attachments.length > 0)
            return this.postMessageWithAttachments(activity);

        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        konsole.log("postActivity", activity);
        return this.checkConnection(true)
            .flatMap(_ =>
                Observable.ajax({
                    method: "POST",
                    url: `${this.domain}/conversations/${this.conversationId}/activities`,
                    body: activity,
                    timeout,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.token}`
                    }
                })
                    .map(ajaxResponse => ajaxResponse.response.id as string)
                    .catch(error => this.catchPostError(error))
            )
            .catch(error => this.catchExpiredToken(error));
    }

    private postMessageWithAttachments({ attachments, ...messageWithoutAttachments }: Message) {
        let formData: FormData;

        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        return this.checkConnection(true)
            .flatMap(_ => {
                // To send this message to DirectLine we need to deconstruct it into a "template" activity
                // and one blob for each attachment.
                formData = new FormData();
                // formData.append('activity', new Blob([JSON.stringify(messageWithoutAttachments)], { type: 'application/vnd.microsoft.activity' }));

                return Observable.from(attachments || [])
                    .flatMap((media: Media) =>
                        Observable.ajax({
                            method: "GET",
                            url: media.contentUrl,
                            responseType: 'arraybuffer'
                        })
                            .do(ajaxResponse =>
                                formData.append('file', new Blob([ajaxResponse.response], { type: media.contentType }), media.name)
                            )
                    )
                    .count()
            })
            .flatMap(_ =>
                Observable.ajax({
                    method: "POST",
                    url: `${this.domain}/conversations/${this.conversationId}/upload?userId=${messageWithoutAttachments.from.id}`,
                    body: formData,
                    timeout,
                    headers: {
                        "Authorization": `Bearer ${this.token}`
                    }
                })
                    .map(ajaxResponse => ajaxResponse.response.id as string)
                    .catch(error => this.catchPostError(error))
            )
            .catch(error => this.catchPostError(error));
    }

    private catchPostError(error: any) {
        if (error.status === 403)
            // token has expired (will fall through to return "retry")
            this.expiredToken();
        else if (error.status >= 400 && error.status < 500)
            // more unrecoverable errors
            return Observable.throw(error);
        return Observable.of("retry");
    }

    private catchExpiredToken(error: any) {
        return error === errorExpiredToken
            ? Observable.of("retry")
            : Observable.throw(error);
    }

    private pollingGetActivity$() {
        const poller$: Observable<AjaxResponse> = Observable.create((subscriber: Subscriber<any>) => {
            // A BehaviorSubject to trigger polling. Since it is a BehaviorSubject
            // the first event is produced immediately.
            const trigger$ = new BehaviorSubject<any>({});

            trigger$.subscribe(() => {
                if (this.connectionStatus$.getValue() === ConnectionStatus.Online) {
                    const startTimestamp = Date.now();

                    Observable.ajax({
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${this.token}`
                        },
                        method: 'GET',
                        url: `${this.domain}/conversations/${this.conversationId}/activities?watermark=${this.watermark}`,
                        timeout
                    }).subscribe(
                        (result: AjaxResponse) => {
                            subscriber.next(result);
                            setTimeout(() => trigger$.next(null), Math.max(0, this.pollingInterval - Date.now() + startTimestamp));
                        },
                        (error: any) => {
                            switch (error.status) {
                                case 403:
                                    this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
                                    setTimeout(() => trigger$.next(null), this.pollingInterval);
                                    break;

                                case 404:
                                    this.connectionStatus$.next(ConnectionStatus.Ended);
                                    break;

                                default:
                                    // propagate the error
                                    subscriber.error(error);
                                    break;
                            }
                        }
                    );
                }
            });
        });

        return this.checkConnection()
            .flatMap(_ => poller$
                .catch(() => Observable.empty<AjaxResponse>())
                .map(ajaxResponse => ajaxResponse.response as ActivityGroup)
                .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup)));
    }

    private observableFromActivityGroup(activityGroup: ActivityGroup) {
        if (activityGroup.watermark)
            this.watermark = activityGroup.watermark;
        return Observable.from(activityGroup.activities);
    }

    private webSocketActivity$(): Observable<Activity> {
        return this.checkConnection()
            .flatMap(_ =>
                this.observableWebSocket<ActivityGroup>()
                    // WebSockets can be closed by the server or the browser. In the former case we need to
                    // retrieve a new streamUrl. In the latter case we could first retry with the current streamUrl,
                    // but it's simpler just to always fetch a new one.
                    .retryWhen(error$ => error$.delay(3000).mergeMap(error => this.reconnectToConversation()))
            )
            .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup))
    }

    // Originally we used Observable.webSocket, but it's fairly opionated  and I ended up writing
    // a lot of code to work around their implemention details. Since WebChat is meant to be a reference
    // implementation, I decided roll the below, where the logic is more purposeful. - @billba
    private observableWebSocket<T>() {
        return Observable.create((subscriber: Subscriber<T>) => {
            konsole.log("creating WebSocket", this.streamUrl);
            this.socketConnection = io(this.streamUrl);

            this.socketConnection.on('close', close => {
                konsole.log("Socket close", close);
                subscriber.error(close);
            });

            this.socketConnection.on('message', (message: any) => {
                message && subscriber.next(JSON.parse(message));
            });

            this.socketConnection.on('open', open => {
                konsole.log("Socket open", open);
            });
        }) as Observable<T>;
    }

    public closeSocketConnection() {
        if (this.socketConnection) {
            this.socketConnection.close();
        }
    }

    private reconnectToConversation() {
        return this.checkConnection(true)
            .flatMap(_ =>
                Observable.ajax({
                    method: "GET",
                    url: `${this.domain}/conversations/${this.conversationId}?watermark=${this.watermark}`,
                    timeout,
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${this.token}`
                    }
                })
                    .do(result => {
                        if (!this.secret)
                            this.token = result.response.token;
                        this.streamUrl = result.response.streamUrl;
                    })
                    .map(_ => null)
                    .retryWhen(error$ => error$
                        .mergeMap(error => {
                            if (error.status === 403) {
                                // token has expired. We can't recover from this here, but the embedding
                                // website might eventually call reconnect() with a new token and streamUrl.
                                this.expiredToken();
                            } else if (error.status === 404) {
                                return Observable.throw(errorConversationEnded);
                            }

                            return Observable.of(error);
                        })
                        .delay(timeout)
                        .take(retries)
                    )
            )
    }
}
