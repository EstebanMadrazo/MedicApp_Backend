const user = require('./User')


test('Testing Connection', ()=>{
    expect(user.getUserByParam()).toBe("Success")
})