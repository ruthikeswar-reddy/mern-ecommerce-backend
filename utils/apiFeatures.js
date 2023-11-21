class ApiFeatures{
    constructor(query,queryStr){
        this.query = query,
        this.queryStr= queryStr
    }

    search(){
        
        const keyword = this.queryStr.keyword
        ?{
            name:{
                // regex: regular expression
                $regex:this.queryStr.keyword,
                //$options : i means case insensitive
                $options: "i"
            }

        }:
        {}
        // here the keyword will be, for suppose if we search name:'rithik' which will be the value of this.queryStr.keyword = {name:'ruthik'}
        // the above is retransformed from ternary operator as {name:{$regex:'ruthik', $options:i}}
        // ... is spread operator ( it makes strings into objects)

        this.query = this.query.find({...keyword})

        // the above code line tells us mongodb find operation using $regex (which is used for pattern matching, also known as regular expression)
        // $options which gives us specifications like 'i':case insensitive operation
        //this.query = this.query.find({name:{$regex:'ruthik', $options: i}}),it finds record with name ruthik by following case insensitivity
        // for more information, visit:https://www.mongodb.com/docs/manual/reference/operator/query/regex/

        return this
    }

    filter(){
        const queryCopy = {...this.queryStr}

        // removing some fields for category
        const removeFields = ['keyword','page','limit']


        removeFields.forEach(key => delete queryCopy[key])

        // filer for price and rating

        let queryStr = JSON.stringify(queryCopy)

        //stringify() method makes object into string
        //ex::: {name:'ruthik', age:10} converts it into {"name":"ruthik", "age":10}


        queryStr= queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`)
        //.replace(1,2)  1.(specification) to find a specified a string,  2.after finding what to replace with.
        //. replace(/regular expression written here/,(key)=> what to change)
        //. replace(//g), g means global replacement it finds the given string globally and replaces it with the given one.
        //. replace(/\b \b/) means to search at specific positions
        //. for example str = "HELLO LOOK" /bLO represents to search for LO  at a begining of a word
        // LO/b is to search for a word starting with LO


        this.query = this.query.find(JSON.parse(queryStr));

        // parse() is used to convert stringified object into Normal object


        return this;

    }


    pagination(resultPerPage){
        const currentPage = this.queryStr.page||1

        const skipPage = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skipPage);

        return this;
    }
}

module.exports = ApiFeatures