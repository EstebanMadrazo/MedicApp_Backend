const daoUser = require("./DaoUsers")
import {getUserByID , storeUser} from './DaoUsers.ts'

test('Testing Jest', ()=>{
    expect(getUserByID()).toBe("8080")
});

test('Testing db creation',()=>{
    //expect(createUser()).toBe("Success")
})