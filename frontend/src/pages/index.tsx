import {useEffect, useState} from "react";

// define lookup keys according to products in stripe dashboard
enum LookupKeys {
    MONTH="month_test",
    SIXMONTHS="sixmonths_test",
    YEAR="year_test"
}
interface ProductProps {
    name: string,
    price: string,
    lookupKey: LookupKeys
}
const ProductDisplay = (props: ProductProps) => {
    return <section>
        <div className="product">
            someImg
            <div className="description">
                <h3>{props.name}</h3>
                <h5>{props.price}</h5>
            </div>
        </div>
        <form action = {`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-checkout-session`} method="POST">

            {/* Add a hidden field with the lookup_key of your Price */}
            <input type="hidden" name="lookup_key" value={props.lookupKey} />
            <button className="text-white bg-blue-700 rounded-lg p-2" id="checkout-and-portal-button" type="submit">
                Checkout
            </button>
        </form>
    </section>
}
const ProductsDisplay = () => {
    return (
        <>
            <div className="flex gap-8 p-4">
                <ProductDisplay name="1 Month Plan" price="300 $" lookupKey={LookupKeys.MONTH}/>
                <ProductDisplay name="6 Months Plan" price="250 $" lookupKey={LookupKeys.SIXMONTHS}/>
                <ProductDisplay name="1 Year Plan" price="200 $" lookupKey={LookupKeys.YEAR}/>

            </div>
            <button className="text-white bg-blue-700 rounded-lg p-2">
                <a href={`${process.env.PORTAL_URL}`}>Portal session</a>
            </button>

        </>
    )
};
const SuccessDisplay = ({ sessionId } : any) => {
    return (
        <section>
            <div className="product Box-root">
                someImg
                <div className="description Box-root">
                    <h3>Subscription to starter plan successful!</h3>
                </div>
            </div>
            <form action={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-portal-session`} method="POST">
                <input
                    type="hidden"
                    id="session-id"
                    name="session_id"
                    value={sessionId}
                />
                <button className="text-white bg-blue-700 rounded-lg p-2" id="checkout-and-portal-button" type="submit">
                    Manage your billing information
                </button>
            </form>
        </section>
    );
};

const Message = ({ message }: any) => (
    <section>
        <p>{message}</p>
    </section>
);

export default function Home() {
    let [message, setMessage] = useState('');
    let [success, setSuccess] = useState(false);
    let [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);

        if (query.get('success')) {
            setSuccess(true);
            setSessionId(query.get('session_id'));
        }

        if (query.get('canceled')) {
            setSuccess(false);
            setMessage(
                "Order canceled -- continue to shop around and checkout when you're ready."
            );
        }
    }, [sessionId]);

    if (!success && message === '') {
        return <ProductsDisplay />;
    } else if (success && sessionId !== '') {
        return <SuccessDisplay sessionId={sessionId} />;
    } else {
        return <Message message={message} />;
    }
}