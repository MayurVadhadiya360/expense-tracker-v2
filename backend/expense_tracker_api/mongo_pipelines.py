
def category_type_amount_pipeline(initMatchStage:dict, dateRange:dict):
    final_pipeline = [
        initMatchStage,
        {
            '$group': {
                '_id': {
                    'category': "$category",
                    'type': "$type"
                },
                'totalAmount': {
                    '$sum': "$amount"
                }
            }
        },
        {
            '$project': {
                '_id': 0,
                'category': "$_id.category",
                'type': "$_id.type",
                'totalAmount': 1
            }
        },
        {
            '$facet': {
                'categories': [
                    {
                        '$group': {
                            '_id': None,
                            'categories': {
                                '$addToSet': "$category"
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'categories': 1
                        }
                    }
                ],
                'totals': [
                    {
                        '$group': {
                            '_id': {
                                'category': "$category",
                                'type': "$type"
                            },
                            'totalAmount': {
                                '$sum': "$amount"
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'category': "$_id.category",
                            'type': "$_id.type",
                            'totalAmount': 1
                        }
                    }
                ]
            }
        },
        {
            '$unwind': "$categories"
        },
        {
            '$unwind': "$categories.categories"
        },
        {
            '$project': {
                'category': "$categories.categories"
            }
        },
        {
            '$addFields': {
                'types': ["Paid", "Received"]
            }
        },
        {
            '$unwind': "$types"
        },
        {
            '$project': {
                'category': 1,
                'type': "$types"
            }
        },
        {
            '$lookup': {
                'from': "transaction",
                'let': {
                    'category': "$category",
                    'type': "$type"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                        '$eq': ["$category", "$$category"]
                                    },
                                    {
                                        '$eq': ["$type", "$$type"]
                                    }
                                ]
                            }
                        }
                    },
                    *([{"$match": { "date": dateRange}}] if dateRange else []),
                    {
                        '$group': {
                            '_id': None,
                            'totalAmount': {
                                '$sum': "$amount"
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'totalAmount': 1
                        }
                    }
                ],
                'as': "totals"
            }
        },
        {
            '$unwind': {
                'path': "$totals",
                'preserveNullAndEmptyArrays': True
            }
        },
        {
            '$addFields': {
                'totalAmount': {
                    '$ifNull': ["$totals.totalAmount", 0]
                }
            }
        },
        {
            '$project': {
                '_id': 0,
                'category': 1,
                'type': 1,
                'totalAmount': 1
            }
        },
        {
            '$sort': {'category': 1,'type': 1}
        }
    ]
    
    return final_pipeline

def date_type_amount_pipeline(initMatchStage:dict, categories:list=[]):
    final_pipeline = [
        initMatchStage,
        # Step 1: Group by date and type to get the total amount for each combination
        {
            '$group': {
                '_id': {
                    'date': "$date",
                    'type': "$type"
                },
                'totalAmount': { '$sum': "$amount" }
            }
        },
        {
            '$project': {
                '_id': 0,
                'date': "$_id.date",
                'type': "$_id.type",
                'totalAmount': 1
            }
        },

        # Step 2: Get distinct dates
        {
            '$facet': {
                'dates': [
                    {
                        '$group': {
                            '_id': None,
                            'dates': { '$addToSet': "$date" }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'dates': 1
                        }
                    }
                ],
                'totals': [
                    {
                        '$group': {
                            '_id': {
                                'date': "$date",
                                'type': "$type"
                            },
                            'totalAmount': { '$sum': "$amount" }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'date': "$_id.date",
                            'type': "$_id.type",
                            'totalAmount': 1
                        }
                    }
                ]
            }
        },

        # Step 3: Create all combinations of dates and types
        {
            '$unwind': "$dates"
        },
        {
            '$unwind': "$dates.dates"
        },
        {
            '$project': {
                'date': "$dates.dates"
            }
        },
        {
            '$addFields': {
                'types': ["Paid", "Received"]
            }
        },
        {
            '$unwind': "$types"
        },
        {
            '$project': {
                'date': 1,
                'type': "$types"
            }
        },

        # Step 4: Perform left outer join with the aggregated results
        {
            '$lookup': {
                'from': "transaction",
                'let': { 'date': "$date", 'type': "$type" },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    { '$eq': ["$date", "$$date"] },
                                    { '$eq': ["$type", "$$type"] }
                                ]
                            }
                        }
                    },
                    # Add category filter 
                    *([{"$match": { "category": { "$in": categories }}}] if categories else []),
                    {
                        '$group': {
                            '_id': None,
                            'totalAmount': { '$sum': "$amount" }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'totalAmount': 1
                        }
                    }
                ],
                'as': "totals"
            }
        },
        {
            '$unwind': {
                'path': "$totals",
                'preserveNullAndEmptyArrays': True
            }
        },

        # Step 5: Set totalAmount to 0 for missing documents
        {
            '$addFields': {
                'totalAmount': { '$ifNull': ["$totals.totalAmount", 0] }
            }
        },

        # Step 6: Project the final output
        {
            '$project': {
                '_id': 0,
                'date': 1,
                'type': 1,
                'totalAmount': 1
            }
        },
        
        # Step 7: Sort the output by date and type
        {
            '$sort': { 'date': 1, 'type': 1 }
        }
    ]
    return final_pipeline

def month_year_type_amount_pipeline(initMatchStage:dict):
    final_pipeline = [
        # Step 1: Filter documents from the last 12 months
        initMatchStage,

        # Step 2: Extract month-year from the date string and convert month to text
        {
            '$project': {
                'year': { '$substr': ["$date", 0, 4] },
                'month': { '$substr': ["$date", 5, 2] },
                'type': 1,
                'amount': 1
            }
        },
        {
            '$addFields': {
                'monthText': {
                    '$let': {
                    'vars': {
                        'monthsInString': [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ]
                    },
                    'in': {
                        '$arrayElemAt': [
                            "$$monthsInString",
                            {
                                '$subtract': [
                                    { '$toInt': "$month" },
                                    1
                                ]
                            }
                        ]
                    }
                    }
                }
            }
        },
        {
            '$project': {
                'yearMonth': {
                    '$concat': ["$monthText", "-", "$year"]
                },
                'year': 1,
                'month': 1,
                'type': 1,
                'amount': 1
            }
        },

        # Step 3: Group by yearMonth and type to get the total amount
        {
            '$group': {
                '_id': {
                    'yearMonth': "$yearMonth",
                    'year': "$year",
                    'month': "$month",
                    'type': "$type"
                },
                'totalAmount': { '$sum': "$amount" }
            }
        },

        {
            '$project': {
                '_id': 0,
                'yearMonth': "$_id.yearMonth",
                'year': { '$toInt': "$_id.year" },
                'month': { '$toInt': "$_id.month" },
                'type': "$_id.type",
                'totalAmount': 1
            }
        },

        # Step 4: Generate all possible year-month combinations
        {
            '$facet': {
                'yearMonths': [
                    {
                        '$group': {
                            '_id': None,
                            'yearMonths': {
                                '$addToSet': {
                                    'year': "$year",
                                    'month': "$month"
                                }
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'yearMonths': 1
                        }
                    }
                ],
                'totals': [
                    {
                        '$group': {
                            '_id': {
                                'yearMonth': "$yearMonth",
                                'year': "$year",
                                'month': "$month",
                                'type': "$type"
                            },
                            'totalAmount': { '$sum': "$totalAmount" }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'yearMonth': "$_id.yearMonth",
                            'year': "$_id.year",
                            'month': "$_id.month",
                            'type': "$_id.type",
                            'totalAmount': 1
                        }
                    }
                ]
            }
        },

        # Step 5: Create all combinations of yearMonth and types
        {
            '$unwind': "$yearMonths"
        },
        {
            '$unwind': "$yearMonths.yearMonths"
        },
        {
            '$project': {
                'yearMonth': {
                    '$concat': [
                        {
                            '$arrayElemAt': [
                                [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December"
                                ],
                                {
                                    '$subtract': [
                                        "$yearMonths.yearMonths.month",
                                        1
                                    ]
                                }
                            ]
                        },
                        "-",
                        {
                            '$toString': "$yearMonths.yearMonths.year"
                        }
                    ]
                },
                'year': "$yearMonths.yearMonths.year",
                'month': "$yearMonths.yearMonths.month",
                'types': ["Paid", "Received"]
            }
        },
        {
            '$unwind': "$types"
        },
        {
            '$project': {
                'yearMonth': 1,
                'year': 1,
                'month': 1,
                'type': "$types"
            }
        },

        # Step 6: Perform left outer join with the aggregated results
        {
            '$lookup': {
                'from': "transaction",
                'let': {
                    'yearMonth': "$yearMonth",
                    'type': "$type"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                    '$eq': [
                                        {
                                            '$concat': [
                                                {
                                                    '$arrayElemAt': [
                                                        [
                                                            "January",
                                                            "February",
                                                            "March",
                                                            "April",
                                                            "May",
                                                            "June",
                                                            "July",
                                                            "August",
                                                            "September",
                                                            "October",
                                                            "November",
                                                            "December"
                                                        ],
                                                        {
                                                            '$subtract': [
                                                                {
                                                                    '$toInt': {
                                                                        '$substr': [
                                                                            "$date", 5, 2
                                                                        ]
                                                                    }
                                                                },
                                                                1
                                                            ]
                                                        }
                                                    ]
                                                },
                                                "-",
                                                {
                                                    '$substr': ["$date", 0, 4]
                                                }
                                            ]
                                        },
                                        "$$yearMonth"
                                    ]
                                    },
                                    { '$eq': ["$type", "$$type"] }
                                ]
                            }
                        }
                    },
                    {
                        '$group': {
                            '_id': None,
                            'totalAmount': { '$sum': "$amount" }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'totalAmount': 1
                        }
                    }
                ],
                'as': "totals"
            }
        },
        {
            '$unwind': {
                'path': "$totals",
                'preserveNullAndEmptyArrays': True
            }
        },

        # Step 7: Set totalAmount to 0 for missing documents
        {
            '$addFields': {
                'totalAmount': {
                    '$ifNull': ["$totals.totalAmount", 0]
                }
            }
        },

        # Step 8: Project the final output
        {
            '$project': {
                '_id': 0,
                'yearMonth': 1,
                'year': 1,
                'month': 1,
                'type': 1,
                'totalAmount': 1
            }
        },

        # Step 9: Sort the output by year, month, and type
        {
            '$sort': { 'year': 1, 'month': 1, 'type': 1 }
        }
    ]
    return final_pipeline