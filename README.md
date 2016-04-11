# My Tenable Job Application

My first Node.js project for a job application with Tenable Security in August 2015 and never heard back from. So, here it is.

Since this was my first ever foray into the world of Node.js development, it's obviously not very good.

## The Task

Build a REST API with a few arbitrary requirements. One requirement was: "No external libraries", which forced me to roll my own crypto rather than use node-sodium and bluebird like a sane human being.

[This was the result](https://github.com/sarciszewski/tenable-job-app/blob/92c68b16b49afda7a8b07cb201a14303587d2329/lib/users.js#L51-L77) of that requirement.
