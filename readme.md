

# Social Currency

## To Dos - 
- convert https://easylist.to/easylist/easylist.txt into list of relevant substrings (there's some markup that I don't think I need) - DONE
- create background php script to check and save matches of previous list  - INITIAL DONE
  - this will run every 12 hours or so, so we're not comparing unnecessarily.
- create background php script to convert list of strings into JS Object : 
```
obj = {
		string[-1.a] : {
						min_length : int,
					   	string[-2.a] : {
										string[-3.a] : true
									  },
						string[-2.b] : true,
					 },
		string[-1.b] : {
						min_length : int,
					   	string[-2.c] : {...}
					   }
		}

```

- Manually test on a variety of wordpress-based pages. 
- complete frontend integration
-- at this point, users who have shared will have ads removed. The next step is to ensure the user actually shared (thinking add a unique-ish query parameter with a mention and then search the site's timeline)
- package it into a plugin
- add social signin for the site owners (which I think I'll need for the FB/Twtr apis)

