// EventDetails.js
import React, { useEffect, useRef, useState } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { ImClock } from 'react-icons/im';
import { PiHandbagSimpleBold } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import { MdOutlineLocationOn } from "react-icons/md";
import { AiOutlineDollar } from "react-icons/ai";
import axios from 'axios';
import useAuth from '../helpers/useAuth';
import { useNavigate } from 'react-router';
import Navbar from './NavBar';
import SimpleMap from './Map';
import CommentSection from './Comment';


const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {isLoggedIn, decodedToken} = useAuth();
  const [bookingId, setBookingId] = useState(null);
  const [waitlistId, setWaitlistId] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [error, setError] = useState('')
  const [replyToId, setReplyToId] = useState('');
  const [commentText, setCommentText] = useState({
    textAreaValue: '',
  });

  const handleTextAreaChange = (e) => {
    setCommentText({
      textAreaValue: e.target.value,
    });
  };

  const handleSubmit = async (e, action, id) => {
    e.preventDefault();

    switch (action){
        case 'makePayment':
            const bookEndPoint = 'https://otv5vi5ofa.execute-api.us-east-2.amazonaws.com/api/v1/book';

            const requestData = {
                requestId: String(Date.now()),
                eventId: eventId,
                email: decodedToken.email,
                userId: decodedToken.userId,
                type: "event"
                };
            
            const res = await axios.post(bookEndPoint, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            console.log(res)
            if (res.status === 200 && res.data.statusCode) {
                console.log("You have already booked this event", res.data)
                navigate('/events');
                return;
            }

            const bookingId = res.data.data.bookingId



            try {
            const paymentBody = {
                requestId: String(Date.now()),
                eventId: eventId,
                userId: decodedToken.userId,
                bookingId,
                type: "event"
            };

            localStorage.setItem('eventId', eventId);      

            const endpoint = 'https://uj1wgatgb1.execute-api.us-east-2.amazonaws.com/api/v1/payments';

            // Use Axios for the POST request
            const response = await axios.post(endpoint, paymentBody, {
                headers: {
                'Content-Type': 'application/json',
                }
            });

            console.log(response);

            if (response.status === 200 && !response.data.statusCode) {
                    window.location.href = response.data.data.url; // Replace with the actual field in your response
            } else {
                // HANDLE FAILURE CASE AFTERWARDS.
            }
            } catch (error) {
            console.error('Error submitting form:', error);
            // HANDLE FAILURE CASE AFTERWARDS.
            }
            break;
        
        case 'removeWaitlist':
        case 'cancelBooking':
            const cancelBookingEndpoint = 'https://nxbrgquyb9.execute-api.us-east-2.amazonaws.com/api/v1/cancelBooking';
            const reqBody = {
                requestId: String(Date.now()),
                email: decodedToken.email,
                userId: decodedToken.userId,
                type: "event",
                bookingId: id
                };
            
            const response = await axios.post(cancelBookingEndpoint, reqBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 200 && response.data.statusCode) {
                console.log("Booking has been cancelled or deleted")
                window.location.reload();
                return;
            }
            break;
        default:
            console.log("No case matched with this")
    }
  };

  async function handleCommentSubmit(e){
    e.preventDefault();
    const {textAreaValue} = commentText;

    if (!textAreaValue.trim()) {
        setError('Please enter a comment.'); // Set an error message if textarea is empty
        return;
      }

    const pushCommentEndpoint = `https://zty8kz1jvl.execute-api.us-east-2.amazonaws.com/api/v1/comment`;
        const requestData = {
            requestId: String(Date.now()),
            eventId: eventId,
            userId: decodedToken.userId,
            comment: textAreaValue,
            replyToId: replyToId
            };
        
        console.log(requestData)
        
        const res = await axios.post(pushCommentEndpoint, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        setCommentText({ textAreaValue: '' });
        setShowReplyForm(false);
        if (res.status === 200 && !res.data.statusCode) {
            window.location.reload();
            return;
        }
  }

    const getDateString = (dateTimeString) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(dateTimeString));
    }

    const getEstTimeString = (dateTimeString) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(dateTimeString));
    }

  useEffect(() => {
    if (!isLoggedIn){
        navigate('/login');
        return
    }

    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://ec2-3-134-104-92.us-east-2.compute.amazonaws.com:6006/api/v1/event/${eventId}`);
        const data = await response.json();
        if (!data.data){
            navigate('/events');
        }
        const isBooked = data.data.bookedSeatsArray.some(booking => booking.user && booking.isComplete && booking.user._id === decodedToken.userId)
        if (isBooked){
            setBookingId(data.data.bookedSeatsArray.map(booking => {
                return booking.user && booking.user._id === decodedToken.userId && booking._id;
            })[0]);
        }
        else{
            setWaitlistId(data.data.waitlistArray.map(booking => {
                return booking.user && booking.user._id === decodedToken.userId && booking._id;
            })[0]);
        }
        setEvent(data.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);
    

  return (
    <>
    <Navbar/>
    <div className="lg:flex lg:items-center lg:justify-between p-4 pt-8">
        <div className="min-w-0 flex-1">
            <div className="container mx-auto p-8">
               {event && 
               (<><h2 className="text-2xl  font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight pb-5">
                {event.title}
                </h2>
                <div className="container mx-auto bg-white rounded-md shadow-md overflow-hidden">
                    <img className="w-full h-full object-cover" src={`data:image/jpeg;base64,${event.image}`} alt={event.title} />
                </div>
                <div className="mt-1 pt-5 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-md text-gray-500">
                        <p className="text-md text-justify"><PiHandbagSimpleBold className='inline mr-2'/> {event.organizer}</p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-gray-500">
                    <p><MdOutlineLocationOn className='inline mr-2'/>{event.location}</p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-gray-500">
                        <p><AiOutlineDollar className='inline mr-2 text-lg'/>{event.price}</p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-gray-500">
                        <p><FaRegCalendarAlt className='inline mr-2'/>{getDateString(event.datetime)}</p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-gray-500">
                        <p><ImClock className='inline mr-2'/>{getEstTimeString(event.datetime)} EST</p>
                    </div>
                </div>

                
                <div class="bg-white">
                <div class="pt-6">
                    <div class="w-full pb-16 pt-10 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:pb-24 lg:pt-16">
                    <div class="lg:col-span-2 lg:pr-8">
                        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Details</h1>
                        <div class="py-10 lg:col-span-2 lg:col-start-1 lg:pr-8 lg:pt-6">
                            <div className='flex-column'>
                                <div>
                                    <div class="space-y-6">
                                        <p class="text-md text-gray-900">{event.description}</p>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    {event.waitlistArray.length || event.maxSeats === event.bookedSeatsArray.filter(booking => booking.isComplete).length ?
                                        <h1 className='inline'>Waitlist: <p className="text-md text-justify inline"> {event.maxWaitlist - event.waitlistArray.length}/{event.maxWaitlist}</p></h1>
                                        :
                                        <h1 className='inline'>Open: <p className="text-md text-justify inline"> {event.maxSeats - event.bookedSeatsArray.filter(booking => booking.isComplete).length}/{event.maxSeats}</p></h1>
                                    }
                                </div>

                                <div class="mt-10">
                                    <div class="text-sm font-medium text-gray-900 flex">
                                        <div className='text-lg'><h1>Tags:</h1></div>
                                        <div>
                                            {event.tags.map((tag) => (
                                            <span class="ml-2 inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2" id=''>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* <form class="rounded-2xl rounded-md shadow-md bg-white rounded-lg border p-2 mx-auto mt-20">
                                    <div class="mb-2 mt-1">
                                        <textarea placeholder="comment" class="w-full rounded border leading-normal resize-none h-20 py-2 px-3 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"></textarea>
                                    </div>
                                    <div class="flex justify-end px-4">
                                        <input type="submit" class="px-2.5 py-1.5 rounded-md text-white text-sm bg-indigo-600" value="Comment"/>
                                    </div>
                                </form> */}
                                <section class="bg-white py-8 lg:py-16 antialiased rounded-md shadow-md mt-5">
  <div class="max-w-2xl mx-auto px-4">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg lg:text-2xl font-bold text-gray-900">Discussion ({event.comments.length})</h2>
        </div>
    <form class="mb-6">
        <div class="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
            <label for="comment" class="sr-only">Your comment</label>
            <textarea id="comment" rows="6" onChange={handleTextAreaChange}
                class="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Write a comment..." required></textarea>
        </div>
        <button type="submit" onClick={handleCommentSubmit}
            class="inline-flex items-center py-2.5 px-4 bg-indigo-600 text-xs font-semibold text-center text-white bg-primary-700 rounded-md focus:ring-4 focus:ring-primary-200 hover:bg-primary-800">
            Post comment
        </button>
    </form>
    {error && <p className="text-red-500">{error}</p>}
    <CommentSection eventId={eventId} userId={decodedToken.userId} comments={event.comments} depth={0}/>
    {/* {event.comments.map(comment => {
    return (<article class="p-6 text-base bg-white rounded-lg">
        <footer class="flex justify-between items-center mb-2">
            <div class="flex items-center">
                <p class="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold"><img
                        class="mr-2 w-6 h-6 rounded-full"
                        src={`data:image/jpeg;base64,${comment.author.id.userPic}`}
                        />{`${comment.author.id.firstName} ${comment.author.id.lastName}`}</p>
                <p class="text-sm text-gray-600"><time pubdate datetime={getDateString(comment.createdAt)}
                        title={getDateString(comment.createdAt)}>{getEstTimeString(comment.createdAt)} EST, {getDateString(comment.createdAt)}</time></p>
            </div>
        </footer>
        <p class="text-gray-500">{comment.text}</p>
        {showReplyForm ? (
          <form className="my-6">
            <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
              <label htmlFor="comment" className="sr-only">Your comment</label>
              <textarea
                id="comment"
                rows="6"
                onChange={handleTextAreaChange}
                value={commentText.textAreaValue}
                className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Write a comment..."
                required
              ></textarea>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex space-x-4">
              <button
                type="submit"
                onClick={handleCommentSubmit}
                className="inline-flex items-center py-2.5 px-4 bg-indigo-600 text-xs font-semibold text-center text-white bg-primary-700 rounded-md focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
              >
                Post comment
              </button>
              <button
                type="button"
                onClick={closeReplyFormHandler}
                className="inline-flex items-center py-2.5 px-4 text-xs font-semibold text-center text-gray-700 bg-gray-200 rounded-md focus:ring-4 focus:ring-gray-300 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </form>
        ) : (
            <div class="flex items-center mt-4 space-x-4">
            <button type="button"
                onClick={() => showReplyFormHandler(comment._id)}
                class="flex items-center text-sm text-gray-500 hover:underline font-medium">
                <svg class="mr-1.5 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
                </svg>
                Reply
            </button>
        </div> 
        )}
        {comment.replies.map(reply => {
            return (
                <>
                <article class="p-6 mb-3 ml-6 lg:ml-12 text-base bg-white rounded-lg">
                    <footer class="flex justify-between items-center mb-2">
                        <div class="flex items-center">
                            <p class="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold"><img
                                    class="mr-2 w-6 h-6 rounded-full"
                                    src={`data:image/jpeg;base64,${reply.author.id.userPic}`}
                                    />{`${comment.author.id.firstName} ${comment.author.id.lastName}`}</p>
                            <p class="text-sm text-gray-600"><time pubdate datetime={getDateString(comment.createdAt)}
                        title={getDateString(comment.createdAt)}>{getEstTimeString(comment.createdAt)} EST, {getDateString(comment.createdAt)}</time></p>
                        </div>
                    </footer>
                    <p class="text-gray-500">{reply.text}</p>
                    <div class="flex items-center mt-4 space-x-4">
                        <button type="button"
                            class="flex items-center text-sm text-gray-500 hover:underline font-medium">
                            <svg class="mr-1.5 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
                            </svg>                
                            Reply
                        </button>
                    </div>
                </article>
                </>
            )
        }) }
    </article>)
    })} */}
  </div>
</section>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="mt-4 lg:row-span-3 lg:mt-0 rounded-2xl rounded-md shadow-md">
                                <div>
                                    <SimpleMap userLatitude={+localStorage.getItem('lat')} userLongitude={+localStorage.getItem('long')} latitude={event.lat} longitude={event.long}/>
                                </div>
                            
                        </div>
                        <div>
                            <div className='pt-3 mt-10'>
                                <span class="text-5xl font-bold tracking-tight text-gray-900">${event.price}</span>
                                <span class="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                            </div>
                            <div class='w-100'>
                                <div className="relative inline-block text-left mt-2" style={{ width: '100%' }} ref={dropdownRef}>
                                    {
                                    bookingId 
                                    ?
                                    <button
                                        key={bookingId}
                                        type="submit"
                                        onClick={(e) => handleSubmit(e, 'cancelBooking', bookingId)}
                                        className="mt-1 block w-full rounded-md bg-yellow-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                                    >
                                        Cancel Booking
                                    </button>
                                    :
                                    waitlistId 
                                    ?
                                    <button
                                        key={waitlistId}
                                        type="submit"
                                        onClick={(e) => handleSubmit(e, 'removeWaitlist', waitlistId)}
                                        className="mt-1 block w-full rounded-md bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    >
                                        Remove from Waitlist
                                    </button>
                                    :
                                    <button
                                        type="submit"
                                        onClick={(e) => handleSubmit(e, 'makePayment')}
                                        className="mt-1 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Make Payment
                                    </button>
                                }
                                </div>
                            </div>
                        </div>
                    </div>

                        {/* <div class="py-10 lg:col-span-2 lg:col-start-1 lg:pr-8 lg:pt-6">
                            <div className='flex-column'>
                                <div>
                                    <div class="space-y-6">
                                        <p class="text-md text-gray-900">{event.description}</p>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    {event.waitlistArray.length || event.maxSeats === event.bookedSeatsArray.filter(booking => booking.isComplete).length ?
                                        <h1 className='inline'>Waitlist: <p className="text-md text-justify inline"> {event.maxWaitlist - event.waitlistArray.length}/{event.maxWaitlist}</p></h1>
                                        :
                                        <h1 className='inline'>Open: <p className="text-md text-justify inline"> {event.maxSeats - event.bookedSeatsArray.filter(booking => booking.isComplete).length}/{event.maxSeats}</p></h1>
                                    }
                                </div>

                                <div class="mt-10">
                                    <div class="text-sm font-medium text-gray-900 flex">
                                        <div className='text-lg'><h1>Tags:</h1></div>
                                        <div>
                                            {event.tags.map((tag) => (
                                            <span class="ml-2 inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2" id=''>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <form class="rounded-2xl rounded-md shadow-md bg-white rounded-lg border p-2 mx-auto mt-20">
                                    <div class="mb-2 mt-1">
                                        <textarea placeholder="comment" class="w-full rounded border leading-normal resize-none h-20 py-2 px-3 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"></textarea>
                                    </div>
                                    <div class="flex justify-end px-4">
                                        <input type="submit" class="px-2.5 py-1.5 rounded-md text-white text-sm bg-indigo-600" value="Comment"/>
                                    </div>
                                </form>
                            </div>
                        </div> */}
                    </div>
                </div>
                </div>
                </>
                )}           
            </div>
        </div>  
    </div>
    </>
  );
};

export default EventDetails;