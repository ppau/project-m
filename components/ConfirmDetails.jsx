import React, {Component} from 'react';

export default class ConfirmDetails extends Component {
    construct() {

    }

    render() {
        return <div>
            <h1>Confirm</h1>

            <div className="form-body">
                <div className="heading">
                    <h2>Declaration </h2>
                    <i> Read the following and click the checkbox below.</i>
                </div>
                <div className="declaration">
                    <div className="declaration-text">
                        <p>I wish to become a member of Pirate Party Australia. I have read and understand the <b><a href="#">Pirate Party
                        Australia Constitution</a></b> and agree with its platform and principles, and will to the best of my
                        ability work to uphold and promote them. </p>

                        <p>I am enrolled for Federal elections, i.e. I am 16 years of age or older. I am an Australian
                        citizen (or a British citizen who was on the Australian Electoral roll on 25 of January 1984)
                        and I have lived at the above address for at least one month.</p>

                        <p>I consent to this form being forwarded to the Australia Electoral Commission (AEC) in support of
                        the party’s application for registration as a political party.</p>

                        <b><a href="#">If you are not enrolled to vote, click here.</a></b>

                    </div>
                </div>
                <label>
                    <input type="checkbox" name="circumstance" ref="resident"/>
                    I confirm that I am enrolled to vote in federal elections and consent to my information being sent
                    to the Australia Electoral Commission.*
                </label>
                <div className="heading">
                    <h2>Check Your Details</h2>
                    <i>Please enter all the data you have entered is correct. It is a serious offence to make a false declaration.</i>
                </div>
                <div className="declaration">
                    <div className="declaration-text">
                        <b> Name: </b> Placeholder Name <br/>
                        <b> DOB: </b> 04/10/1988 <br/>
                        <b> Gender: </b> placeholder gender<br/>
                        <b> Residential Address: </b> 123 Placeholder St, NSW, Australia, 2000 <br/>
                        <b> Postal Address: </b> 123 SameAsAbove, NSW, Australia, 2000 <br/>
                        <b> Email: </b> placeholder@email.com <br/>
                        <b> Phone: </b> 0412 345 678 <br/>
                    </div>
                </div>
            </div>
            <div className="navigation">
                <button onClick={this.props.nextStep}>Continue</button>
            </div>
        </div>
    }
}