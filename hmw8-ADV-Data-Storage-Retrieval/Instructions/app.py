#matplotlib notebook
from matplotlib import style
style.use('fivethirtyeight')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook
import seaborn as sns
import os

import numpy as np
import pandas as pd
import datetime as dt

# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, func

from flask import Flask, jsonify

#database set up
engine = create_engine("sqlite:///Resources/hawaii.sqlite")
conn = engine.connect()

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
Measurement = Base.classes.measurement
Station = Base.classes.station

# Create our session (link) from Python to the DB
session = Session(engine)

app = Flask(__name__)

query_date = dt.date.today() - dt.timedelta(days=730)  

# Perform a query to retrieve the data and precipitation scores
last_2year = session.query(Measurement.date, Measurement.prcp, Measurement.tobs).\
    filter(Measurement.date > query_date)

# Unpack the `dates` and `prcp` from results and save into separate lists
TwoYearDates = [r[0] for r in last_2year]
TwoYearPrcp = [r[1] for r in last_2year]
TwoYearTobs = [r[2] for r in last_2year]
prcp_dictionary = dict(zip(TwoYearDates, TwoYearPrcp))
tob_dictionary = dict(zip(TwoYearDates, TwoYearTobs))
all_prcp = list(np.ravel(prcp_dictionary))
all_tobs = list(np.ravel(tob_dictionary))

stations = session.query(Station.id, Station.station)
stations_list = [r[1] for r in stations]

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/precipitation<br/>"
        f"/api/v1.0/stations<br/>"
        f"/api/v1.0/tobs<br/>"
        f"/api/v1.0/<start>/<end>"
    )


@app.route("/api/v1.0/precipitation")
def precipitation():
    """Return a list of all passenger names"""
    
    return jsonify(all_prcp)
    
@app.route("/api/v1.0/stations")
def stations():
             
    return jsonify(stations_list)

@app.route("/api/v1.0/tobs")
def tobs():
    
    return jsonify(all_tobs)

@app.route("/api/v1.0/<start>")
def vacation(start):
    VacaBeg = start #set one less date before the year beg date 7/2

    calc_temp = session.query(func.avg(Measurement.tobs),func.max(Measurement.tobs),func.min(Measurement.tobs)).\
        filter(Measurement.date > VacaBeg).statement

    #write into a dataframe
    TempStat = pd.read_sql_query(calc_temp, session.bind)
    TAve = int(TempStat['avg_1'])
    TMax = int(TempStat['max_1'])
    TMin = int(TempStat['min_1'])
    
    Templist = pd.DataFrame({'Stats': ["Ave_Temp","Max_Temp","Min_Temp"], 'value': [TAve, TMax, TMin]})
    # turn df to dict
    df4_as_json = Templist.to_dict(orient='split')

    #Return the json representation of your dictionary.
    return jsonify({'status': 'ok', 'json_data': df4_as_json})


@app.route("/api/v1.0/<start>/<end>")
def Vacation1(start,end):

    VacaBeg1 = start #set one less date before the year beg date 7/2
    VacaEnd1 = end #set one less date before the year beg date 7/15

    calc_temp1 = session.query(func.avg(Measurement.tobs),func.max(Measurement.tobs),func.min(Measurement.tobs)).\
        filter(Measurement.date > VacaBeg1).filter(Measurement.date < VacaEnd1).statement

    #write into a dataframe
    TempStat1 = pd.read_sql_query(calc_temp1, session.bind)
    TAve1 = int(TempStat1['avg_1'])
    TMax1 = int(TempStat1['max_1'])
    TMin1 = int(TempStat1['min_1'])
    
    Templist1 = pd.DataFrame({'Stats': ["Ave_Temp","Max_Temp","Min_Temp"], 'value': [TAve1, TMax1, TMin1]})
    # turn df to dict
    df5_as_json = Templist1.to_dict(orient='split')

    #Return the json representation of your dictionary.
    return jsonify({'status': 'ok', 'json_data': df5_as_json})

    

if __name__ == '__main__':
    app.run(debug=True)
