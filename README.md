# authenticate-core

Core workflow coordinator for authenticating credentials.


## Overview

authenticate-core provides an engine for wiring up validation, models, and two-factor mechanisms that
together enable two-way authentication. The core engine does not provide any authentication services itself, 
but it provides the hooks and workflows necessary for authentication and feedback as to the progress.

## Usage

The first step is to define the validator and sender functions as well as the model for persisting the 
authentication.

### validator

The most trivial validator would be:

    var validateAll = function(email){ return email; };
    
This would validate all emails passed into the `validateAll` function.

The validator expects the argument to be the address type of the two factor method. Typically this is an email address,
but it could be a phone number for text messaging, or any other address. 

To invalidate a particular address, the validator should return something other than the email. For example, to 
only allow emails from a particular domain:

    var validateDomain = function(email) { 
      if( email.match( /@mydomain.com$/ )){
        return email;
      }
      return null;
    };
 
### model

to be completed







