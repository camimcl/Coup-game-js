## How to create a case

Create a class that extends the `BaseCase.ts`. See `DukeCase.ts` as example.

## BaseCase.ts

This class contains common fields and methods that will be used in multiple cases. When you need to add something to handle a single case, think about if it may be needed somewhere else. If so, create a generic method for it.
