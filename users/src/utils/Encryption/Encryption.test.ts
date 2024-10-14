const handler = require('./EncryptionHandler')

test('Testing Hashing passwords', ()=>{
    const password = 'something in the way'
    const hash = "96a8d330c8173f3ba4638de76f7371be7add97fe5845152ede965da0a389b22e";
    expect(handler.hashPassword(password)).toBe(hash);
})