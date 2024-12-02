namespace Ballerina

type Range = { skip:int; take:int }
with static member Default(skip:int, take:int): Range = { skip = skip; take = take }
